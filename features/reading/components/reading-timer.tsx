/**
 * ReadingTimer.tsx
 *
 * Timer sesi membaca dengan:
 * - Start / Pause / Stop
 * - Auto pause saat app background / inactive
 * - Auto pause saat navigasi keluar
 * - Auto resume saat app kembali ke foreground (jika timer sedang jalan)
 * - Timestamp-based timer (akurat)
 * - Auto start saat component mount (opsional)
 *
 * iOS fix:
 * - Track previousAppState untuk deteksi transisi yang benar
 * - Resume menggunakan setTimeout(0) agar React state flush dulu
 *   sebelum startTimestampRef dan isRunning di-set ulang
 */

import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

import {
	AppState,
	AppStateStatus,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { Button } from 'react-native-paper';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface ReadingTimerProps {
	onSessionEnd?: (totalSeconds: number) => void;
	onStart?: () => void; 
	onPause?: (totalSeconds: number) => void;
	onFinish?: (totalSeconds: number) => void;
	onResume?: () => void;
	autoStart?: boolean;
    verseData?: any;
	startFromSeconds?: number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatTime(totalSeconds: number): string {
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;

	if (h > 0) {
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

const ReadingTimer: React.FC<ReadingTimerProps> = ({
	onSessionEnd,
	onStart,
	onPause,
    onResume,
	onFinish,
	autoStart = false,
    verseData = null,
	startFromSeconds = 0,
}) => {
	const [seconds, setSeconds]     = useState(startFromSeconds);
	const [isRunning, setIsRunning] = useState(false);

	const isRunningRef = useRef(false);
	const secondsRef   = useRef(startFromSeconds);
    
	/**
	 * Basis timestamp timer.
	 * Rumus: Date.now() - (accumulated_seconds * 1000)
	 * Elapsed = Date.now() - startTimestampRef -> selalu akurat
	 * termasuk setelah resume dari pause.
	 */
	const startTimestampRef = useRef<number | null>(null);

	/**
	 * Flag resume setelah foreground.
	 * Di-set true hanya saat timer running lalu app masuk background.
	 * Tidak di-set saat navigasi — auto-resume hanya untuk background/foreground.
	 */
	const shouldResumeAfterForeground = useRef(false);
	const hasFinished = useRef(false);

	/**
	 * [iOS fix]
	 * Track AppState sebelumnya untuk deteksi transisi yang benar.
	 *
	 * iOS menembak urutan: active -> inactive -> background -> inactive -> active
	 * Tanpa ini, event 'inactive' pertama langsung trigger pause + flag resume,
	 * tapi event 'inactive' kedua (setelah background) bisa overwrite flag
	 * atau trigger pause ganda.
	 *
	 * Dengan previousAppState, pause hanya terjadi saat transisi:
	 *   active/unknown -> inactive/background
	 * Dan resume hanya saat transisi dari background (bukan inactive pertama).
	 */
	const previousAppState = useRef<AppStateStatus>(AppState.currentState);

	const isFocused = useIsFocused();

	// ── sync refs ──────────────────────────────────────────────

	useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
	useEffect(() => { secondsRef.current   = seconds;   }, [seconds]);

	// ── interval ───────────────────────────────────────────────

	useEffect(() => {
		if (!isRunning || !isFocused) return;

		const id = setInterval(() => {
			if (startTimestampRef.current === null) return;
			const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
			setSeconds(elapsed);
			secondsRef.current = elapsed;
		}, 1000);

		return () => clearInterval(id);
	}, [isRunning, isFocused]);

	// ── pauseTimer ─────────────────────────────────────────────

	const pauseTimer = useCallback((triggerCallback = true) => {
		if (!isRunningRef.current) return;

        const now = Date.now();
		const elapsed = startTimestampRef.current !== null
			? Math.floor((now - startTimestampRef.current) / 1000)
			: secondsRef.current;

		startTimestampRef.current = null;
		isRunningRef.current      = false;

		setIsRunning(false);
		setSeconds(elapsed);
		secondsRef.current = elapsed;

		if (triggerCallback) onSessionEnd?.(elapsed);

		// Jangan panggil onPause jika sudah finish
		if (!hasFinished.current) {
			onPause?.(elapsed);
		}
	}, [onSessionEnd, onPause]);

	// ── startTimer ─────────────────────────────────────────────

	const startTimer = useCallback(() => {
		if (isRunningRef.current) return;

		startTimestampRef.current = Date.now() - secondsRef.current * 1000;
		isRunningRef.current      = true;
		setIsRunning(true);

		if (secondsRef.current === 0) {
			onStart?.();   // ← fresh start
		} else {
			onResume?.();  // ← lanjut dari pause
		}
	}, [onStart, onResume]);

	// ── resumeTimerAfterForeground (internal) ──────────────────

	/**
	 * [iOS fix]
	 * Tidak pakai startTimer() untuk resume dari foreground,
	 * karena isRunningRef sudah false akibat pauseTimer() dan
	 * React state belum tentu flush saat event 'active' masuk.
	 *
	 * setTimeout(0) memastikan semua setState dari pauseTimer()
	 * sudah diproses sebelum kita set ulang startTimestamp dan isRunning.
	 */
	const resumeTimerAfterForeground = useCallback(() => {
		setTimeout(() => {
			if (shouldResumeAfterForeground.current) {
				shouldResumeAfterForeground.current = false;
				startTimestampRef.current = Date.now() - secondsRef.current * 1000;
				isRunningRef.current      = true;
				setIsRunning(true);
				onResume?.();  // ← opsional
			}
		}, 0);
	}, [onResume]);

	// ── AppState: auto pause + auto resume ─────────────────────

	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
			const prevState = previousAppState.current;
			previousAppState.current = nextState;

			/**
			 * PAUSE — hanya saat transisi dari foreground ke background/inactive.
			 *
			 * iOS sequence: active -> inactive -> background
			 * Kita pause di 'inactive' pertama (dari 'active') dan catat flag.
			 * Jika 'background' menyusul, tidak perlu pause lagi (timer sudah pause).
			 *
			 * Kenapa pause di 'inactive' dan bukan di 'background' saja?
			 * Karena di iOS, app bisa lama di state 'inactive' (misal: control center
			 * dibuka) tanpa pernah sampai ke 'background'. Pause di 'inactive'
			 * memastikan timer berhenti di semua skenario.
			 */
			if (nextState === 'inactive' || nextState === 'background') {
				if (prevState === 'active') {
					// Transisi pertama dari active -> catat flag dan pause
					shouldResumeAfterForeground.current = isRunningRef.current;
					pauseTimer(false);
				}
				// Jika prevState bukan 'active' (misal inactive -> background),
				// tidak lakukan apa-apa — timer sudah di-pause sebelumnya
			}

			/**
			 * RESUME — saat kembali ke active.
			 *
			 * iOS sequence kembali: background -> inactive -> active
			 * Kita resume di 'active' saja, bukan di 'inactive'.
			 */
			if (nextState === 'active') {
				resumeTimerAfterForeground();
			}
		});

		return () => subscription.remove();
	}, [pauseTimer, resumeTimerAfterForeground]);

	// ── navigation: auto pause (tanpa auto-resume) ─────────────

	useFocusEffect(
		useCallback(() => {
			return () => {
				// Navigasi keluar: pause tapi TIDAK set shouldResumeAfterForeground
				// supaya auto-resume tidak terpicu saat balik ke halaman ini
				pauseTimer();
			};
		}, [pauseTimer])
	);

	// ── auto start ─────────────────────────────────────────────

	useEffect(() => {
		if (verseData) {
			if (autoStart && !isRunningRef.current && secondsRef.current === 0 && !hasFinished.current) {
				startTimer();
			}
		}
	}, [autoStart, startTimer]);

	// ── handlers ───────────────────────────────────────────────

	const handleToggle = () => {
		if (isRunning) {
			// User pause manual -> batalkan auto-resume agar tidak resume
			// sendiri saat app di-background setelah ini
			shouldResumeAfterForeground.current = false;
			pauseTimer();
		} else {
			startTimer();
		}
	};

	const handleReset = () => {
		shouldResumeAfterForeground.current = false;
		hasFinished.current = true; // ← set SEBELUM pauseTimer agar onPause di-skip
		pauseTimer(false);

		onFinish?.(secondsRef.current);

		startTimestampRef.current = null;
		secondsRef.current        = 0;
		setSeconds(0);
	};

	// ── render ─────────────────────────────────────────────────

	return (
		<View style={styles.row}>
			<Text style={styles.time}>{formatTime(seconds)}</Text>

			<View style={styles.action}>
				{seconds > 0 && (
					<Button onPress={handleReset} textColor='#c10'>
						Finish
					</Button>
				)}

				<Button onPress={handleToggle} mode={isRunning ? 'contained-tonal' : 'contained'}>
					{isRunning ? 'Pause' : (seconds > 0 ? 'Continue' : 'Start')}
				</Button>
			</View>
		</View>
	);
};

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderTopWidth: 2,
		borderTopColor: '#e5e5e5',
	},
	time: {
		fontSize: 20,
		fontWeight: '700',
		fontVariant: ['tabular-nums'],
		minWidth: 52,
	},
	action: {
		flexDirection: 'row',
		gap: 12,
	},
});

export default ReadingTimer;
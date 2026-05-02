import { Stack } from "expo-router";

export default function OnboardingLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="choose-language"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}
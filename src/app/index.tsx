import { useTranslation } from "react-i18next";
import { Button, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { changeLanguage } from "@/utils/i18n";

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>{t("home.title")}</Text>

        <View style={styles.buttonContainer}>
          <Text style={styles.subtitle}>{t("home.switch_language")}</Text>
          <Button title="العربية" onPress={() => changeLanguage("ar")} />
          <Button title="Français" onPress={() => changeLanguage("fr")} />
          <Button title="English" onPress={() => changeLanguage("en")} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row", // Supports RTL well
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
  },
  buttonContainer: {
    gap: 10,
    width: "100%",
  },
});

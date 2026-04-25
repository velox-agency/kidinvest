import React from "react";
import { useTranslation } from "react-i18next";

import { NativeTabs } from "expo-router/build/native-tabs";

export default function AppTabs() {
  const { t } = useTranslation();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t("tabs.home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="games">
        <NativeTabs.Trigger.Label>{t("tabs.games")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="toys_and_games" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wallet">
        <NativeTabs.Trigger.Label>{t("tabs.wallet")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="money_bag" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="music">
        <NativeTabs.Trigger.Label>{t("tabs.music")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="music_note" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

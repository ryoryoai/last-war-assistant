import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { toast } from "sonner";
import {
  ArrowLeft,
  AtSign,
  CalendarDays,
  Check,
  ChevronDown,
  Code,
  ExternalLink,
  Home,
  Languages,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
  User,
} from "lucide-react";
import {
  de,
  enUS,
  es,
  fr,
  id,
  ja,
  ko,
  ptBR,
  ru,
  th,
  vi,
  zhCN,
  zhTW,
  type Locale as DateFnsLocale,
} from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  allServerRecords,
  getGroupForSerial,
  getServerMissionDay,
  getServerMonthRange,
  localCalendarDateToSerial,
  serialToLocalCalendarDate,
  serialToDate,
  serverGroupByNumber,
  serverGroups,
  type MissionGroup,
  type ServerRecord,
} from "@/lib/mission";
import {
  languageOptions,
  resolveLocale,
  translations,
  type InstallGuidePlatform,
  type LocaleCode,
  type LocalePreference,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

const appVersion = "2026-06-25-02";
const excludedServersCookieName = "lastwar-secret-mission-excluded-servers";
const appBasePath = "/secret-mission/";
const authorPagePath = "/secret-mission/author/";
const footerAutoHideDelayMs = 1600;
const authorUrl = "https://github.com/ryoryoai";
const githubUrl = "https://github.com/ryoryoai/last-war-assistant";
const xProfileUrl = "https://x.com/ryoryoai";
const cloudflarePrivacyUrl = "https://www.cloudflare.com/privacypolicy/";
const footerLinkClassName =
  "text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const footerShellClassName =
  "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-2 shadow-[0_-8px_24px_rgb(0_0_0/0.08)] backdrop-blur transition-[transform,opacity] duration-200 ease-out supports-backdrop-filter:backdrop-blur motion-reduce:transition-none sm:px-6";
const dateFnsLocales: Record<LocaleCode, DateFnsLocale> = {
  de,
  en: enUS,
  es,
  fr,
  id,
  ja,
  ko,
  pt: ptBR,
  ru,
  th,
  vi,
  "zh-Hans": zhCN,
  "zh-Hant": zhTW,
};
const groupClassName: Record<MissionGroup, string> = {
  A: "border-[var(--mission-a-border)] bg-[var(--mission-a-bg)] text-[var(--mission-a-foreground)] hover:bg-[var(--mission-a-hover)]",
  B: "border-[var(--mission-b-border)] bg-[var(--mission-b-bg)] text-[var(--mission-b-foreground)] hover:bg-[var(--mission-b-hover)]",
  C: "border-[var(--mission-c-border)] bg-[var(--mission-c-bg)] text-[var(--mission-c-foreground)] hover:bg-[var(--mission-c-hover)]",
};
const groupSurfaceClassName: Record<MissionGroup, string> = {
  A: "border-[var(--mission-a-border)] bg-[var(--mission-a-bg)] text-[var(--mission-a-foreground)]",
  B: "border-[var(--mission-b-border)] bg-[var(--mission-b-bg)] text-[var(--mission-b-foreground)]",
  C: "border-[var(--mission-c-border)] bg-[var(--mission-c-bg)] text-[var(--mission-c-foreground)]",
};
const groupTabClassName: Record<MissionGroup, string> = {
  A: "border-[var(--mission-a-border)] text-[var(--mission-a-foreground)] hover:bg-[var(--mission-a-bg)] data-active:bg-[var(--mission-a-bg)] data-active:text-[var(--mission-a-foreground)]",
  B: "border-[var(--mission-b-border)] text-[var(--mission-b-foreground)] hover:bg-[var(--mission-b-bg)] data-active:bg-[var(--mission-b-bg)] data-active:text-[var(--mission-b-foreground)]",
  C: "border-[var(--mission-c-border)] text-[var(--mission-c-foreground)] hover:bg-[var(--mission-c-bg)] data-active:bg-[var(--mission-c-bg)] data-active:text-[var(--mission-c-foreground)]",
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};
type ServerListMode = "today" | "next";
type LegalDialog = "notice" | "privacy";
type AppPage = "author" | "home";

function detectInstallGuidePlatform(): InstallGuidePlatform {
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isIpadOnDesktopMode = platform === "MacIntel" && navigator.maxTouchPoints > 1;

  if (/iPad|iPhone|iPod/.test(userAgent) || isIpadOnDesktopMode) {
    return "ios";
  }

  if (/Android/.test(userAgent)) {
    return "android";
  }

  return "desktop";
}

function isRunningStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}

function readStoredLocalePreference(): LocalePreference {
  const preference = localStorage.getItem("lastwar-locale") as LocalePreference | null;
  return preference === "auto" || (preference && translations[preference]) ? preference : "auto";
}

function getCookieValue(name: string) {
  return (document.cookie || "")
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function readExcludedServers() {
  const savedServers = getCookieValue(excludedServersCookieName);

  if (!savedServers) {
    return [];
  }

  try {
    return Array.from(
      new Set(
        decodeURIComponent(savedServers)
          .split(",")
          .map(Number)
          .filter((number) => serverGroupByNumber.has(number)),
      ),
    ).sort((a, b) => a - b);
  } catch (_error) {
    return [];
  }
}

function saveExcludedServers(servers: number[]) {
  if (servers.length === 0) {
    document.cookie = `${excludedServersCookieName}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  const value = encodeURIComponent(servers.join(","));
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${excludedServersCookieName}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

function copyTextFallback(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.inset = "0 auto auto 0";
  textArea.style.opacity = "0";
  textArea.style.pointerEvents = "none";
  document.body.append(textArea);
  textArea.focus({ preventScroll: true });
  textArea.select();
  textArea.setSelectionRange(0, text.length);

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch (_error) {
    copied = false;
  }

  textArea.remove();
  return copied;
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function normalizePathname(pathname: string) {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function readCurrentPage(): AppPage {
  return normalizePathname(window.location.pathname) === authorPagePath ? "author" : "home";
}

function useBrowserLanguages() {
  const [languages, setLanguages] = useState(() => [
    ...(navigator.languages || []),
    navigator.language,
  ].filter(Boolean));

  useEffect(() => {
    const updateLanguages = () => {
      setLanguages([...(navigator.languages || []), navigator.language].filter(Boolean));
    };

    window.addEventListener("languagechange", updateLanguages);
    return () => window.removeEventListener("languagechange", updateLanguages);
  }, []);

  return languages;
}

function AppShell() {
  const browserLanguages = useBrowserLanguages();
  const [now, setNow] = useState(() => new Date());
  const [localePreference, setLocalePreference] = useState(readStoredLocalePreference);
  const [excludedServers, setExcludedServers] = useState(readExcludedServers);
  const [isExclusionOpen, setIsExclusionOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installGuidePlatform, setInstallGuidePlatform] =
    useState<InstallGuidePlatform>("desktop");
  const [isInstalledApp, setIsInstalledApp] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [waitingServiceWorker, setWaitingServiceWorker] = useState<ServiceWorker | null>(null);
  const [activeServerList, setActiveServerList] = useState<ServerListMode>("today");
  const [legalDialog, setLegalDialog] = useState<LegalDialog | null>(null);
  const [currentPage, setCurrentPage] = useState<AppPage>(readCurrentPage);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isFooterInteracting, setIsFooterInteracting] = useState(false);
  const footerHideTimerRef = useRef<number | null>(null);

  const missionDay = useMemo(() => getServerMissionDay(now), [now]);
  const [selectedMissionSerial, setSelectedMissionSerial] = useState(missionDay.serial);
  const [hasManualCalendarSelection, setHasManualCalendarSelection] = useState(false);
  const selectedCalendarDate = useMemo(
    () => serialToLocalCalendarDate(selectedMissionSerial),
    [selectedMissionSerial],
  );
  const currentCalendarDate = useMemo(
    () => serialToLocalCalendarDate(missionDay.serial),
    [missionDay.serial],
  );
  const selectedMissionDate = useMemo(
    () => serialToDate(selectedMissionSerial),
    [selectedMissionSerial],
  );
  const todayGroup = useMemo(
    () => getGroupForSerial(selectedMissionSerial),
    [selectedMissionSerial],
  );
  const nextGroup = useMemo(
    () => getGroupForSerial(selectedMissionSerial + 1),
    [selectedMissionSerial],
  );
  const isCurrentMissionDaySelected = selectedMissionSerial === missionDay.serial;
  const [calendarMonth, setCalendarMonth] = useState(() =>
    serialToLocalCalendarDate(getServerMonthRange(missionDay.serial).firstSerial),
  );
  const locale = useMemo(
    () => resolveLocale(localePreference, browserLanguages),
    [browserLanguages, localePreference],
  );
  const copy = translations[locale];
  const excludedServerSet = useMemo(() => new Set(excludedServers), [excludedServers]);
  const todayServers = useMemo(
    () => serverGroups[todayGroup].filter((number) => !excludedServerSet.has(number)),
    [excludedServerSet, todayGroup],
  );
  const nextServers = useMemo(
    () => serverGroups[nextGroup].filter((number) => !excludedServerSet.has(number)),
    [excludedServerSet, nextGroup],
  );
  const serverListTabs: Array<{
    copyAria: string;
    group: MissionGroup;
    label: string;
    servers: number[];
    value: ServerListMode;
  }> = [
    {
      copyAria: copy.copyServersAria,
      group: todayGroup,
      label: isCurrentMissionDaySelected ? copy.currentTargetLabel : copy.selectedMissionLabel,
      servers: todayServers,
      value: "today",
    },
    {
      copyAria: copy.copyNextServersAria(nextGroup),
      group: nextGroup,
      label: isCurrentMissionDaySelected ? copy.nextGroupLabel : copy.followingGroupLabel,
      servers: nextServers,
      value: "next",
    },
  ];

  const countdownLabel = useMemo(
    () => formatCountdown(missionDay.nextResetDate.getTime() - now.getTime()),
    [missionDay.nextResetDate, now],
  );
  const serverDateValue = useMemo(
    () =>
      new Intl.DateTimeFormat(copy.dateLocale, {
        day: "numeric",
        month: "2-digit",
        timeZone: "UTC",
        year: "numeric",
      }).format(selectedMissionDate),
    [copy.dateLocale, selectedMissionDate],
  );
  const renderCalendarDayButton = useCallback(
    (props: React.ComponentProps<typeof CalendarDayButton>) => (
      <MissionCalendarDayButton todaySerial={missionDay.serial} {...props} />
    ),
    [missionDay.serial],
  );
  const calendarComponents = useMemo(
    () => ({ DayButton: renderCalendarDayButton }),
    [renderCalendarDayButton],
  );

  const clearFooterHideTimer = useCallback(() => {
    if (footerHideTimerRef.current === null) {
      return;
    }

    window.clearTimeout(footerHideTimerRef.current);
    footerHideTimerRef.current = null;
  }, []);

  const scheduleFooterHide = useCallback(() => {
    clearFooterHideTimer();
    footerHideTimerRef.current = window.setTimeout(() => {
      setIsFooterVisible(false);
      footerHideTimerRef.current = null;
    }, footerAutoHideDelayMs);
  }, [clearFooterHideTimer]);

  const revealFooter = useCallback(() => {
    setIsFooterVisible(true);

    if (isFooterInteracting) {
      clearFooterHideTimer();
      return;
    }

    scheduleFooterHide();
  }, [clearFooterHideTimer, isFooterInteracting, scheduleFooterHide]);

  const showUpdateDialog = useCallback((worker: ServiceWorker | null) => {
    setWaitingServiceWorker(worker);
    setUpdateDialogOpen(true);
  }, []);

  const checkForAppUpdate = useCallback(async () => {
    try {
      const response = await fetch(`${appBasePath}version.json?time=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const { version } = (await response.json()) as { version?: string };

      if (version && version !== appVersion) {
        showUpdateDialog(null);
      }
    } catch (_error) {
      // The interval will retry; update checks should not interrupt the tool.
    }
  }, [showUpdateDialog]);

  const navigateToPage = useCallback((page: AppPage) => {
    const nextPath = page === "author" ? authorPagePath : appBasePath;

    if (normalizePathname(window.location.pathname) !== nextPath) {
      window.history.pushState(null, "", nextPath);
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    document.documentElement.lang = copy.htmlLang;
    document.documentElement.dataset.locale = locale;
    document.documentElement.dataset.localePreference = localePreference;
    document.title = currentPage === "author" ? copy.authorPageDocumentTitle : copy.title;
  }, [copy.authorPageDocumentTitle, copy.htmlLang, copy.title, currentPage, locale, localePreference]);

  useEffect(() => {
    const handlePopState = () => setCurrentPage(readCurrentPage());

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => revealFooter();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        [" ", "ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp"].includes(event.key)
      ) {
        revealFooter();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      clearFooterHideTimer();
    };
  }, [clearFooterHideTimer, revealFooter]);

  useEffect(() => {
    if (isFooterInteracting) {
      setIsFooterVisible(true);
      clearFooterHideTimer();
      return;
    }

    if (isFooterVisible) {
      scheduleFooterHide();
    }
  }, [clearFooterHideTimer, isFooterInteracting, isFooterVisible, scheduleFooterHide]);

  useEffect(() => {
    if (!hasManualCalendarSelection) {
      setSelectedMissionSerial(missionDay.serial);
    }
  }, [hasManualCalendarSelection, missionDay.serial]);

  useEffect(() => {
    localStorage.setItem("lastwar-locale", localePreference);
  }, [localePreference]);

  useEffect(() => {
    saveExcludedServers(excludedServers);
  }, [excludedServers]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const legacyDisplayModeQuery = displayModeQuery as MediaQueryList & {
      addListener?: (listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };
    const updateInstalledState = () => setIsInstalledApp(isRunningStandalone());

    updateInstalledState();
    window.addEventListener("appinstalled", updateInstalledState);
    if ("addEventListener" in displayModeQuery) {
      displayModeQuery.addEventListener("change", updateInstalledState);
    } else {
      legacyDisplayModeQuery.addListener?.(updateInstalledState);
    }

    return () => {
      window.removeEventListener("appinstalled", updateInstalledState);
      if ("removeEventListener" in displayModeQuery) {
        displayModeQuery.removeEventListener("change", updateInstalledState);
      } else {
        legacyDisplayModeQuery.removeListener?.(updateInstalledState);
      }
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;
    const updateTimer = window.setInterval(() => {
      void registration?.update();
    }, 60 * 60 * 1000);
    const handleControllerChange = () => window.location.reload();

    navigator.serviceWorker.register(`${appBasePath}sw.js`).then((nextRegistration) => {
      registration = nextRegistration;

      if (nextRegistration.waiting) {
        showUpdateDialog(nextRegistration.waiting);
      }

      nextRegistration.addEventListener("updatefound", () => {
        const newWorker = nextRegistration.installing;

        if (!newWorker) {
          return;
        }

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateDialog(newWorker);
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    void checkForAppUpdate();
    const versionTimer = window.setInterval(checkForAppUpdate, 30 * 60 * 1000);

    return () => {
      window.clearInterval(updateTimer);
      window.clearInterval(versionTimer);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, [checkForAppUpdate, showUpdateDialog]);

  const copyServerList = async (serverNumbers: number[]) => {
    const text = serverNumbers.join(",");

    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success(copy.copySuccess);
        return;
      }

      if (!copyTextFallback(text)) {
        throw new Error("Clipboard unavailable");
      }

      toast.success(copy.copySuccess);
    } catch (_error) {
      copyTextFallback(text) ? toast.success(copy.copySuccess) : toast.error(copy.copyFailed);
    }
  };
  const handleServerListChange = (value: unknown) => {
    if (value === "today" || value === "next") {
      setActiveServerList(value);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    const nextSerial = localCalendarDateToSerial(date);

    setSelectedMissionSerial(nextSerial);
    setHasManualCalendarSelection(nextSerial !== missionDay.serial);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setActiveServerList("today");
  };

  const handleInstall = async () => {
    if (isInstalledApp || isRunningStandalone()) {
      toast.info(copy.installAlreadyAdded);
      return;
    }

    if (!deferredInstallPrompt) {
      setInstallGuidePlatform(detectInstallGuidePlatform());
      setInstallDialogOpen(true);
      return;
    }

    try {
      await deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      setDeferredInstallPrompt(null);
    } catch (_error) {
      setInstallGuidePlatform(detectInstallGuidePlatform());
      setInstallDialogOpen(true);
    }
  };

  const handleUpdate = () => {
    if (waitingServiceWorker) {
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    window.location.reload();
  };

  const toggleServerExclusion = (serverNumber: number) => {
    setExcludedServers((currentServers) => {
      const nextServers = currentServers.includes(serverNumber)
        ? currentServers.filter((number) => number !== serverNumber)
        : [...currentServers, serverNumber];

      return nextServers.sort((a, b) => a - b);
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pt-4 pb-16 sm:px-6 sm:pb-20 lg:pt-6">
      {currentPage === "author" ? (
        <AuthorPage copy={copy} onBackHome={() => navigateToPage("home")} />
      ) : (
        <>
          <Card className="shadow-sm">
            <CardHeader className="gap-3">
              <CardTitle className="text-3xl leading-tight font-semibold tabular-nums sm:text-5xl">
                {copy.countdownTitle(countdownLabel)}
              </CardTitle>
              <div className="flex flex-wrap gap-2 text-sm font-medium text-muted-foreground">
                <span>{copy.serverDateLabel(serverDateValue)}</span>
                <span aria-hidden="true">·</span>
                <span>{copy.selectedMissionSummary(todayGroup, nextGroup)}</span>
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-sm">
            <CardContent>
              <Tabs
                value={activeServerList}
                onValueChange={handleServerListChange}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2" aria-label={copy.serverListTabsAria}>
                  {serverListTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        "min-h-16 flex-col rounded-b-none border-b px-3 data-active:-mb-px data-active:border-b-transparent data-active:shadow-sm",
                        groupTabClassName[tab.group],
                      )}
                    >
                      <span className="text-xs font-semibold opacity-80">{tab.label}</span>
                      <span className="text-4xl leading-none font-semibold">{tab.group}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {serverListTabs.map((tab) => (
                  <TabsContent
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "-mt-px border p-3 sm:p-4",
                      tab.value === "today"
                        ? "rounded-r-xl rounded-b-xl"
                        : "rounded-b-xl rounded-l-xl",
                      groupSurfaceClassName[tab.group],
                    )}
                  >
                    <p className="mb-3 text-sm font-medium opacity-75">{copy.copyHint}</p>
                    <button
                      type="button"
                      className="grid w-full grid-cols-[repeat(5,minmax(0,1fr))] gap-2 text-left sm:grid-cols-[repeat(10,minmax(0,1fr))] md:grid-cols-[repeat(14,minmax(0,1fr))] lg:grid-cols-[repeat(18,minmax(0,1fr))] xl:grid-cols-[repeat(20,minmax(0,1fr))]"
                      aria-label={tab.copyAria}
                      onClick={() => copyServerList(tab.servers)}
                    >
                      {tab.servers.map((number) => (
                        <ServerChip
                          key={number}
                          record={{ closed: false, group: tab.group, number }}
                          className="cursor-copy"
                        />
                      ))}
                    </button>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-5 text-muted-foreground" />
                <CardTitle className="text-xl">{copy.calendarTitle}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                month={calendarMonth}
                onMonthChange={(month) =>
                  setCalendarMonth(new Date(month.getFullYear(), month.getMonth(), 1))
                }
                selected={selectedCalendarDate}
                today={currentCalendarDate}
                onSelect={handleCalendarSelect}
                locale={dateFnsLocales[locale]}
                showOutsideDays={false}
                className="w-full p-0 [--cell-size:3rem] sm:[--cell-size:3.75rem]"
                classNames={{
                  caption_label: "text-sm font-semibold",
                  day: "p-0",
                  month: "flex w-full flex-col gap-3",
                  month_caption: "flex h-(--cell-size) w-full items-center justify-center px-14",
                  month_grid: "w-full",
                  months: "relative flex w-full flex-col gap-4",
                  nav: "absolute top-0 left-1/2 flex w-44 -translate-x-1/2 items-center justify-between sm:w-52",
                  root: "w-full",
                  week: "mt-1 grid w-full grid-cols-7 gap-1",
                  weekday:
                    "flex h-7 items-center justify-center text-xs font-medium text-muted-foreground",
                  weekdays: "grid grid-cols-7 gap-1",
                }}
                components={calendarComponents}
                aria-label={copy.calendarTitle}
                buttonVariant="outline"
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <Collapsible open={isExclusionOpen} onOpenChange={setIsExclusionOpen}>
              <CollapsibleTrigger
                render={
                  <button className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left text-lg font-semibold" />
                }
              >
                <span>{copy.exclusionSettingsTitle}</span>
                <ChevronDown
                  className={cn(
                    "size-5 text-muted-foreground transition-transform",
                    isExclusionOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 border-t pt-4">
                  <div
                    className="flex flex-wrap items-center gap-2"
                    aria-label={copy.groupLegendAria}
                  >
                    {(["A", "B", "C"] as MissionGroup[]).map((group) => (
                      <span
                        key={group}
                        className={cn(
                          "inline-flex h-8 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-semibold",
                          groupClassName[group],
                        )}
                      >
                        {group}
                      </span>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setExcludedServers([])}>
                      <RotateCcw className="size-4" />
                      {copy.resetExclusionsLabel}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-12">
                    {allServerRecords.map((record) => (
                      <ServerExclusionButton
                        key={record.number}
                        copy={copy}
                        excluded={excludedServerSet.has(record.number)}
                        onToggle={toggleServerExclusion}
                        record={record}
                      />
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </>
      )}

      <footer
        className={cn(
          footerShellClassName,
          isFooterVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-[calc(100%+0.5rem)] opacity-0",
        )}
        onPointerEnter={() => setIsFooterInteracting(true)}
        onPointerLeave={() => setIsFooterInteracting(false)}
        onFocusCapture={() => setIsFooterInteracting(true)}
        onBlurCapture={(event) => {
          const footer = event.currentTarget;
          window.setTimeout(() => {
            if (!footer.contains(document.activeElement)) {
              setIsFooterInteracting(false);
            }
          }, 0);
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ThemeModeToggle copy={copy} />
            <div className="flex items-center gap-2 rounded-lg border bg-background px-2">
              <Languages className="size-4 text-muted-foreground" />
              <Select
                value={localePreference}
                onValueChange={(value) => setLocalePreference(value as LocalePreference)}
              >
                <SelectTrigger
                  className="h-8 border-0 bg-transparent px-0 shadow-none"
                  aria-label={copy.languageAria}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === "auto" ? copy.languageAuto : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isInstalledApp && (
              <Button variant="outline" onClick={handleInstall}>
                <Home className="size-4" />
                {copy.installButton}
              </Button>
            )}
          </div>
          <nav
            aria-label={copy.footerLinksAria}
            className="flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {copy.unofficialFanSiteLabel}
            </span>
            <span aria-hidden="true" className="text-xs text-muted-foreground/60">
              ·
            </span>
            <button
              type="button"
              className={footerLinkClassName}
              onClick={() => setLegalDialog("notice")}
            >
              {copy.noticeLinkLabel}
            </button>
            <span aria-hidden="true" className="text-xs text-muted-foreground/60">
              ·
            </span>
            <button
              type="button"
              className={footerLinkClassName}
              onClick={() => setLegalDialog("privacy")}
            >
              {copy.privacyLinkLabel}
            </button>
            <span aria-hidden="true" className="text-xs text-muted-foreground/60">
              ·
            </span>
            <a className={footerLinkClassName} href={githubUrl} rel="noreferrer" target="_blank">
              {copy.githubLinkLabel}
            </a>
            <span aria-hidden="true" className="text-xs text-muted-foreground/60">
              ·
            </span>
            <a
              className={footerLinkClassName}
              href={authorPagePath}
              onClick={(event) => {
                event.preventDefault();
                navigateToPage("author");
              }}
            >
              {copy.authorLinkLabel}
            </a>
          </nav>
        </div>
      </footer>

      <Dialog
        open={legalDialog === "notice"}
        onOpenChange={(open) => {
          if (!open) {
            setLegalDialog(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.noticeDialogTitle}</DialogTitle>
            <DialogDescription>{copy.noticeDialogDescription}</DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {copy.noticeItems.map((item) => (
              <li key={item} className="rounded-lg border bg-muted/40 p-3 leading-6">
                {item}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog
        open={legalDialog === "privacy"}
        onOpenChange={(open) => {
          if (!open) {
            setLegalDialog(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.privacyDialogTitle}</DialogTitle>
            <DialogDescription>{copy.privacyDialogDescription}</DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {copy.privacyItems.map((item) => (
              <li key={item} className="rounded-lg border bg-muted/40 p-3 leading-6">
                {item}
              </li>
            ))}
          </ul>
          <a
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={cloudflarePrivacyUrl}
            rel="noreferrer"
            target="_blank"
          >
            {copy.privacyCloudflareLinkLabel}
          </a>
        </DialogContent>
      </Dialog>

      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.installDialogTitle}</DialogTitle>
            <DialogDescription>{copy.installDialogDescription}</DialogDescription>
          </DialogHeader>
          <ol className="grid gap-2 text-sm">
            {copy.installSteps[installGuidePlatform].map((step, index) => (
              <li key={step} className="flex gap-3 rounded-lg border bg-muted/40 p-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="leading-6">{step}</span>
              </li>
            ))}
          </ol>
          <DialogFooter>
            <Button onClick={() => setInstallDialogOpen(false)}>{copy.closeButton}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{copy.updateAvailable}</DialogTitle>
            <DialogDescription>Last War Assistant</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleUpdate}>
              <Check className="size-4" />
              {copy.updateButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function AuthorPage({
  copy,
  onBackHome,
}: {
  copy: (typeof translations)[LocaleCode];
  onBackHome: () => void;
}) {
  return (
    <section className="grid gap-4">
      <Card className="shadow-sm">
        <CardHeader className="gap-4">
          <Button variant="outline" size="sm" className="self-start" onClick={onBackHome}>
            <ArrowLeft className="size-4" />
            {copy.authorPageBackLabel}
          </Button>
          <div className="grid gap-2">
            <CardTitle className="text-3xl leading-tight font-semibold sm:text-5xl">
              {copy.authorPageTitle}
            </CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {copy.authorPageIntro}
            </p>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{copy.authorPageGreetingTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy.authorPageGreeting}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{copy.authorPageLinksTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            <a
              className="flex min-h-13 items-center justify-between gap-3 rounded-lg border bg-background p-3 text-sm font-medium transition-colors hover:bg-muted"
              href={xProfileUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span className="flex min-w-0 items-center gap-2">
                <AtSign className="size-4 shrink-0" />
                <span className="truncate">{copy.authorPageXProfileLabel}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
            </a>
            <a
              className="flex min-h-13 items-center justify-between gap-3 rounded-lg border bg-background p-3 text-sm font-medium transition-colors hover:bg-muted"
              href={authorUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span className="flex min-w-0 items-center gap-2">
                <User className="size-4 shrink-0" />
                <span className="truncate">{copy.authorPageGitHubProfileLabel}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
            </a>
            <a
              className="flex min-h-13 items-center justify-between gap-3 rounded-lg border bg-background p-3 text-sm font-medium transition-colors hover:bg-muted"
              href={githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Code className="size-4 shrink-0" />
                <span className="truncate">{copy.authorPageRepositoryLabel}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
            </a>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function ThemeModeToggle({ copy }: { copy: (typeof translations)[LocaleCode] }) {
  const { setTheme, theme = "system" } = useTheme();
  const options = [
    { icon: Monitor, value: "system" },
    { icon: Sun, value: "light" },
    { icon: Moon, value: "dark" },
  ] as const;

  useEffect(() => {
    document.documentElement.dataset.themePreference = theme;
  }, [theme]);

  return (
    <div
      className="grid h-9 grid-cols-3 rounded-lg border bg-background p-1"
      aria-label={copy.themeAria}
      role="group"
    >
      {options.map(({ icon: Icon, value }) => (
        <Button
          key={value}
          aria-label={copy.themeOptions[value]}
          aria-pressed={theme === value}
          className="h-7 w-8 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
          data-active={theme === value}
          size="icon-sm"
          title={copy.themeOptions[value]}
          type="button"
          variant="ghost"
          onClick={() => setTheme(value)}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  );
}

function ServerChip({
  className,
  record,
}: {
  className?: string;
  record: ServerRecord;
}) {
  return (
    <span
      className={cn(
        "flex h-10 items-center justify-center rounded-lg border px-2 text-sm font-semibold tabular-nums",
        record.group ? groupClassName[record.group] : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {record.number}
    </span>
  );
}

function ServerExclusionButton({
  copy,
  excluded,
  onToggle,
  record,
}: {
  copy: (typeof translations)[LocaleCode];
  excluded: boolean;
  onToggle: (serverNumber: number) => void;
  record: ServerRecord;
}) {
  if (record.closed || !record.group) {
    return (
      <span
        aria-disabled="true"
        aria-label={copy.closedServerAria(record.number)}
        className="flex h-10 items-center justify-center rounded-lg border border-border bg-muted px-2 text-sm font-semibold tabular-nums text-muted-foreground opacity-45"
      >
        {record.number}
      </span>
    );
  }

  return (
    <Button
      aria-label={copy.serverAria(record.number, record.group)}
      aria-pressed={excluded}
      className={cn(
        "h-10 rounded-lg border px-2 text-sm font-semibold tabular-nums",
        groupClassName[record.group],
        excluded && "opacity-40 saturate-50",
      )}
      type="button"
      variant="outline"
      onClick={() => onToggle(record.number)}
    >
      {record.number}
    </Button>
  );
}

function MissionCalendarDayButton({
  className,
  day,
  modifiers,
  todaySerial,
  ...props
}: React.ComponentProps<typeof CalendarDayButton> & { todaySerial: number }) {
  const serial = localCalendarDateToSerial(day.date);
  const group = getGroupForSerial(serial);
  const isToday = serial === todaySerial;

  return (
    <CalendarDayButton
      className={cn(
        "h-13 min-h-13 min-w-0 rounded-lg border p-0 text-center font-semibold shadow-none sm:h-15 sm:min-h-15 [&>span]:opacity-100",
        groupClassName[group],
        isToday && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
        modifiers.selected && "ring-3 ring-primary ring-offset-2 ring-offset-background",
        modifiers.focused && !modifiers.selected && "ring-2 ring-ring",
        className,
      )}
      day={day}
      modifiers={modifiers}
      {...props}
    >
      <span className="absolute top-1.5 left-1.5 text-[11px] leading-none tabular-nums sm:top-2 sm:left-2">
        {day.date.getDate()}
      </span>
      <span className="absolute inset-0 grid place-items-center text-base leading-none sm:text-lg">
        {group}
      </span>
    </CalendarDayButton>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="lastwar-theme">
      <AppShell />
      <Toaster position="bottom-center" />
    </ThemeProvider>
  );
}

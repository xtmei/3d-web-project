import * as React from "react";
import type { CSSProperties } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { Panel as ResizePanel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useAppStore } from "@/app/store";
import { MapScene } from "@/viz/MapScene";
import { createNoiseTextureDataUrl } from "./theme/noise";
import { BottomTabs } from "./BottomTabs";
import { CommandBar } from "./CommandBar";
import { Panel } from "./components/Panel";
import { OobTree } from "./OobTree";
import { StatusBar } from "./StatusBar";
import { UnitDetails } from "./UnitDetails";

export function Layout() {
  const density = useAppStore((state) => state.density);
  const mobileTab = useAppStore((state) => state.mobileTab);
  const panelCollapsed = useAppStore((state) => state.panelCollapsed);
  const togglePanelCollapsed = useAppStore((state) => state.togglePanelCollapsed);
  const loadState = useAppStore((state) => state.loadState);
  const setLoadState = useAppStore((state) => state.setLoadState);
  const leftPanelRef = React.useRef<ImperativePanelHandle>(null);
  const rightPanelRef = React.useRef<ImperativePanelHandle>(null);

  useKeyboardShortcuts();

  React.useEffect(() => {
    if (panelCollapsed.left) {
      leftPanelRef.current?.collapse();
    } else {
      leftPanelRef.current?.expand(22);
    }
  }, [panelCollapsed.left]);

  React.useEffect(() => {
    if (panelCollapsed.right) {
      rightPanelRef.current?.collapse();
    } else {
      rightPanelRef.current?.expand(30);
    }
  }, [panelCollapsed.right]);

  React.useEffect(() => {
    if (loadState !== "loading") {
      return;
    }
    const timer = window.setTimeout(() => setLoadState("ready"), 320);
    return () => window.clearTimeout(timer);
  }, [loadState, setLoadState]);

  const noiseTexture = React.useMemo(() => createNoiseTextureDataUrl(), []);
  const shellStyle = React.useMemo(
    () =>
      ({
        "--noise-image": noiseTexture ? `url("${noiseTexture}")` : "none"
      }) as CSSProperties,
    [noiseTexture]
  );

  return (
    <div className="app-shell" data-density={density} style={shellStyle}>
      <div className="ui-grid-layer" />
      <div className="ui-noise-layer" />
      <div className="ui-scanline-layer" />
      <div className="app-shell-content">
        <CommandBar
          onToggleLeftPanel={() => togglePanelCollapsed("left")}
          onToggleRightPanel={() => togglePanelCollapsed("right")}
          leftCollapsed={panelCollapsed.left}
          rightCollapsed={panelCollapsed.right}
        />

        <main className="hidden min-h-0 flex-1 md:block">
          <PanelGroup direction="horizontal" autoSaveId="stalingrad-layout-main">
            <ResizePanel ref={leftPanelRef} order={1} defaultSize={22} minSize={16} collapsible collapsedSize={0}>
              <Panel title="Order of Battle" subtitle="Searchable archival tree">
                <OobTree />
              </Panel>
            </ResizePanel>
            <PanelResizeHandle className="resize-handle" />
            <ResizePanel order={2} minSize={35}>
              <Panel title="Operational Map" subtitle="Orthographic city sector view">
                <MapScene />
              </Panel>
            </ResizePanel>
            <PanelResizeHandle className="resize-handle" />
            <ResizePanel ref={rightPanelRef} order={3} defaultSize={30} minSize={22} collapsible collapsedSize={0}>
              <Panel title="Unit Record" subtitle="Battalion dossier & company matrix">
                <UnitDetails />
              </Panel>
            </ResizePanel>
          </PanelGroup>
        </main>

        <main className="min-h-0 flex-1 md:hidden">
          {mobileTab === "oob" ? (
            <Panel title="Order of Battle" subtitle="Tree & filters">
              <OobTree />
            </Panel>
          ) : null}
          {mobileTab === "map" ? (
            <Panel title="Operational Map" subtitle="Touch pan/zoom">
              <MapScene />
            </Panel>
          ) : null}
          {mobileTab === "details" ? (
            <Panel title="Unit Record" subtitle="Summary & company details">
              <UnitDetails />
            </Panel>
          ) : null}
        </main>

        <StatusBar />
        <BottomTabs />
      </div>
    </div>
  );
}

function useKeyboardShortcuts() {
  const setMobileTab = useAppStore((state) => state.setMobileTab);
  const setSelectedUnitId = useAppStore((state) => state.setSelectedUnitId);
  const setSearch = useAppStore((state) => state.setSearch);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        const input = document.querySelector('input[aria-label="Global search"]') as HTMLInputElement | null;
        input?.focus();
      }
      if (event.key.toLowerCase() === "g") {
        setMobileTab("map");
      }
      if (event.key.toLowerCase() === "o") {
        setMobileTab("oob");
      }
      if (event.key.toLowerCase() === "d") {
        setMobileTab("details");
      }
      if (event.key === "Escape") {
        setSelectedUnitId(null);
        setSearch("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setMobileTab, setSearch, setSelectedUnitId]);
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { IPhoneMockup } from "react-device-mockup";

/** Tablets + desktops show the phone mockup; real phones stay full-bleed. */
const DESKTOP_FRAME_QUERY = "(min-width: 768px)";

interface MobileShellContextValue {
  isFramed: boolean;
}

const MobileShellContext = createContext<MobileShellContextValue>({
  isFramed: false,
});

export function useMobileShellFrame() {
  return useContext(MobileShellContext);
}

function subscribeFrameQuery(onStoreChange: () => void) {
  const media = window.matchMedia(DESKTOP_FRAME_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getFrameSnapshot() {
  return window.matchMedia(DESKTOP_FRAME_QUERY).matches;
}

function getServerFrameSnapshot() {
  return false;
}

function useDesktopMobileFrame() {
  return useSyncExternalStore(
    subscribeFrameQuery,
    getFrameSnapshot,
    getServerFrameSnapshot,
  );
}

/**
 * Estimate total IPhoneMockup footprint for island portrait.
 * Must include bezel + side-button gutters (content-box padding), not only the screen.
 */
function estimateMockupSize(screenWidth: number) {
  const frameW = Math.max(1, Math.floor((screenWidth * 10) / 390));
  const screenH = Math.floor((screenWidth / 9) * 19.5);
  const btn = Math.floor(frameW * 0.9);
  const half = Math.floor(frameW / 2);
  const sidePad = Math.max(0, btn - half);
  return {
    width: screenWidth + frameW * 2 + sidePad * 2,
    height: screenH + frameW * 2,
  };
}

function useMockupFit(isFramed: boolean) {
  const [fit, setFit] = useState({ screenWidth: 360, scale: 1 });

  useEffect(() => {
    if (!isFramed) return;

    function update() {
      const padX = 24;
      const padY = 24;
      const availW = Math.max(280, window.innerWidth - padX);
      const availH = Math.max(480, window.innerHeight - padY);

      // Prefer a phone-sized screen, then shrink until the full bezel fits.
      let screenWidth = Math.min(390, availW);
      for (let i = 0; i < 48; i += 1) {
        const { width, height } = estimateMockupSize(screenWidth);
        if (width <= availW && height <= availH) break;
        const factor = Math.min(availW / width, availH / height, 0.985);
        const next = Math.floor(screenWidth * factor);
        if (next >= screenWidth) {
          screenWidth = Math.max(280, screenWidth - 4);
        } else {
          screenWidth = Math.max(280, next);
        }
      }

      const { width, height } = estimateMockupSize(screenWidth);
      const scale = Math.min(1, availW / width, availH / height) * 0.98;

      setFit({
        screenWidth: Math.max(280, screenWidth),
        scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
      });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [isFramed]);

  return fit;
}

export function MobileDeviceFrame({ children }: { children: ReactNode }) {
  const isFramed = useDesktopMobileFrame();
  const { screenWidth, scale } = useMockupFit(isFramed);

  if (!isFramed) {
    return (
      <MobileShellContext.Provider value={{ isFramed: false }}>
        {children}
      </MobileShellContext.Provider>
    );
  }

  return (
    <MobileShellContext.Provider value={{ isFramed: true }}>
      <div
        className="flex h-[100dvh] max-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#ddd9ce] px-3 py-3"
        data-testid="mobile-device-frame-shell"
      >
        <div
          className="drop-shadow-[0_24px_48px_rgba(32,40,37,0.22)]"
          data-testid="mobile-device-frame"
          style={{
            transform: scale < 0.999 ? `scale(${scale})` : undefined,
            transformOrigin: "center center",
          }}
        >
          <IPhoneMockup
            screenWidth={screenWidth}
            screenType="island"
            frameColor="#1c1c1e"
            hideStatusBar
            hideNavBar
            className="rescutes-mobile-device-mockup"
          >
            {/*
              Fill only the mockup screen. Never use 100dvh here - that is the
              iPad/desktop viewport and will blow past the bezel.
            */}
            <div className="rescutes-mobile-screen-root flex h-full max-h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-bone">
              {children}
            </div>
          </IPhoneMockup>
        </div>
      </div>
    </MobileShellContext.Provider>
  );
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { IPhoneMockup } from "react-device-mockup";

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

function useDesktopMobileFrame() {
  const [isFramed, setIsFramed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_FRAME_QUERY);

    function sync() {
      setIsFramed(media.matches);
    }

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isFramed;
}

function usePhoneScreenWidth(isFramed: boolean) {
  const [screenWidth, setScreenWidth] = useState(360);

  useEffect(() => {
    if (!isFramed) return;

    function update() {
      const verticalPadding = 64;
      const horizontalPadding = 48;
      const maxHeight = window.innerHeight - verticalPadding;
      const maxWidth = window.innerWidth - horizontalPadding;
      const fromHeight = Math.floor(maxHeight * (9 / 19.5));
      const capped = Math.min(390, maxWidth, fromHeight);
      setScreenWidth(Math.max(320, capped));
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isFramed]);

  return screenWidth;
}

export function MobileDeviceFrame({ children }: { children: ReactNode }) {
  const isFramed = useDesktopMobileFrame();
  const screenWidth = usePhoneScreenWidth(isFramed);

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
        className="flex min-h-[100dvh] items-center justify-center bg-[#ddd9ce] px-4 py-6"
        data-testid="mobile-device-frame-shell"
      >
        <div
          className="drop-shadow-[0_24px_48px_rgba(32,40,37,0.22)]"
          data-testid="mobile-device-frame"
        >
          <IPhoneMockup
            screenWidth={screenWidth}
            screenType="island"
            frameColor="#1c1c1e"
            hideStatusBar
            hideNavBar
            className="rescutes-mobile-device-mockup"
          >
            <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-bone">
              {children}
            </div>
          </IPhoneMockup>
        </div>
      </div>
    </MobileShellContext.Provider>
  );
}

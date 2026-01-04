import { useRef } from "react";
import { useBottomBarVisibility } from "@/app/context/NavBarVisibilityContext";

export const useScrollHandler = () => {
  const { setVisible, visible } = useBottomBarVisibility();
  const offset = useRef(0);

  const onScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - offset.current;

    // 1. Ignore small scrolls (jitter protection)
    // If the difference is less than 3px, do nothing
    if (Math.abs(diff) < 3) return;

    // 2. Logic:
    // - If scrolling DOWN (diff > 0) AND passed the top area (> 20px) -> Hide
    // - If scrolling UP (diff < 0) -> Show
    if (diff > 0 && currentOffset > 60) {
  if (visible) setVisible(false);
} else if (diff < -2) {
  if (!visible) setVisible(true);
}

    // 3. Update offset for the next calculation
    offset.current = currentOffset;
  };

  return onScroll;
};
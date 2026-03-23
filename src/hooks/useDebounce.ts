import { useState, useEffect } from "react";

/**
 * Hook để trì hoãn việc cập nhật giá trị cho đến khi sau một khoảng thời gian nhất định
 * @param value Giá trị cần debounce
 * @param delay Khoảng thời gian trễ (ms)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Thiết lập một timeout để cập nhập debouncedValue sau 'delay' ms
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy timeout nếu value hoặc delay thay đổi (ví dụ khi người dùng gõ tiếp)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

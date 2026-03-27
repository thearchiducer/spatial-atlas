import { useEffect, useRef, useState } from "react";
import SecondaryToolsPanel from "./SecondaryToolsPanel";

const MIN_DOCK_WIDTH = 560;
const DEFAULT_DOCK_WIDTH = 720;
const MAX_DOCK_WIDTH = 1200;
const SNAP_WIDTHS = [720, 880, 1040, 1200];

function clampWidth(width) {
  return Math.min(MAX_DOCK_WIDTH, Math.max(MIN_DOCK_WIDTH, width));
}

function getNearestSnapWidth(width) {
  return SNAP_WIDTHS.reduce((closest, current) => {
    return Math.abs(current - width) < Math.abs(closest - width)
      ? current
      : closest;
  }, SNAP_WIDTHS[0]);
}

export default function SecondaryToolsDock({
  isOpen,
  onClose,
  width = DEFAULT_DOCK_WIDTH,
  setWidth,
  ...panelProps
}) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  function handleResizeStart(event) {
    event.preventDefault();
    setIsResizing(true);
    startXRef.current = event.clientX;
    startWidthRef.current = width;
  }

  function handleResizeReset(event) {
    event.preventDefault();
    setWidth(DEFAULT_DOCK_WIDTH);
  }

  useEffect(() => {
    if (!isResizing) return;

    function handleMouseMove(event) {
      const delta = startXRef.current - event.clientX;
      const nextWidth = clampWidth(startWidthRef.current + delta);
      setWidth(nextWidth);
    }

    function handleMouseUp() {
      setIsResizing(false);
      setWidth((current) => getNearestSnapWidth(clampWidth(current)));
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setWidth]);

  return (
    <>
      {!isOpen ? (
        <div className='fixed right-0 top-0 z-30 h-screen w-[2px] bg-stone-300 opacity-40' />
      ) : null}

      <div
        className={`fixed inset-0 z-40 bg-stone-900/5 transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col border-l border-stone-300 bg-white shadow-[0_0_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${isResizing ? "select-none" : ""}`}
        style={{
          width: `${width}px`,
          minWidth: `${MIN_DOCK_WIDTH}px`,
          maxWidth: `${MAX_DOCK_WIDTH}px`,
        }}
      >
        <button
          type='button'
          onMouseDown={handleResizeStart}
          onDoubleClick={handleResizeReset}
          className='absolute left-0 top-0 z-10 h-full w-3 -translate-x-1/2 cursor-col-resize bg-transparent'
          aria-label='Resize secondary tools dock'
          title='Drag to resize · Double-click to reset'
        >
          <span className='absolute left-1/2 top-1/2 h-20 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-stone-300' />
        </button>

        <div className='flex items-center justify-between border-b border-stone-200 px-4 py-3'>
          <div>
            <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
              Docked tools
            </div>
            <h2 className='mt-1 text-lg font-semibold tracking-tight text-stone-900'>
              Secondary tools
            </h2>
          </div>

          <div className='flex items-center gap-2'>
            <div
              className='border border-stone-300 bg-stone-50 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-stone-600'
              title='Current snapped dock width'
            >
              {getNearestSnapWidth(width)}px
            </div>

            <button
              type='button'
              onClick={onClose}
              className='border border-stone-300 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-stone-700 transition hover:bg-stone-100'
            >
              Close
            </button>
          </div>
        </div>

        <div className='border-b border-stone-200 px-4 py-2'>
          <div className='flex flex-wrap gap-2'>
            {SNAP_WIDTHS.map((snap) => {
              const isActive = getNearestSnapWidth(width) === snap;

              return (
                <button
                  key={snap}
                  type='button'
                  onClick={() => setWidth(snap)}
                  className={`border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] transition ${
                    isActive
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {snap}
                </button>
              );
            })}
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto p-4'>
          <SecondaryToolsPanel
            {...panelProps}
            secondaryToolsOpen={true}
            secondaryToolsCount={panelProps.secondaryToolsCount}
            setShowSecondaryTools={() => {}}
            docked
          />
        </div>
      </aside>
    </>
  );
}

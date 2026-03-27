export default function MetricCard({ value, label }) {
  return (
    <div className='border border-stone-300 bg-white px-4 py-3'>
      <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
        {label}
      </div>

      <div className='mt-1 text-lg font-semibold text-stone-900'>{value}</div>
    </div>
  );
}

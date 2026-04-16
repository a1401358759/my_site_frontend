import { useMemo, useState } from 'react';

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function buildCalendarCells(viewDate, today) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];

  for (let index = 0; index < 42; index += 1) {
    if (index < firstWeekday) {
      const day = daysInPrevMonth - firstWeekday + index + 1;
      cells.push({
        key: `prev-${day}-${index}`,
        date: new Date(year, month - 1, day),
        day,
        inCurrentMonth: false,
      });
      continue;
    }

    const dayInCurrentMonth = index - firstWeekday + 1;
    if (dayInCurrentMonth <= daysInMonth) {
      const date = new Date(year, month, dayInCurrentMonth);
      cells.push({
        key: `curr-${dayInCurrentMonth}`,
        date,
        day: dayInCurrentMonth,
        inCurrentMonth: true,
        isToday: isSameDay(date, today),
      });
      continue;
    }

    const day = dayInCurrentMonth - daysInMonth;
    cells.push({
      key: `next-${day}-${index}`,
      date: new Date(year, month + 1, day),
      day,
      inCurrentMonth: false,
    });
  }

  return cells;
}

function CalendarWidget() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const currentYear = today.getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 41 }, (_, index) => currentYear - 20 + index),
    [currentYear]
  );
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);
  const cells = useMemo(() => buildCalendarCells(viewDate, today), [viewDate, today]);

  const goPrevMonth = () => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const onYearChange = (event) => {
    const nextYear = Number(event.target.value);
    setViewDate((current) => new Date(nextYear, current.getMonth(), 1));
  };

  const onMonthChange = (event) => {
    const nextMonth = Number(event.target.value);
    setViewDate((current) => new Date(current.getFullYear(), nextMonth, 1));
  };

  return (
    <div className="mini-calendar" aria-label="日历">
      <div className="mini-calendar__header">
        <button type="button" onClick={goPrevMonth} aria-label="上个月">
          <span>‹</span>
        </button>
        <div className="mini-calendar__picker">
          <label>
            <select value={viewDate.getFullYear()} onChange={onYearChange} aria-label="选择年份">
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
          </label>
          <label>
            <select value={viewDate.getMonth()} onChange={onMonthChange} aria-label="选择月份">
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month + 1}月
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" onClick={goNextMonth} aria-label="下个月">
          <span>›</span>
        </button>
      </div>

      <div className="mini-calendar__weekdays">
        {WEEK_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mini-calendar__grid">
        {cells.map((cell) => (
          <span
            key={cell.key}
            className={[
              'mini-calendar__cell',
              cell.inCurrentMonth ? '' : 'is-muted',
              cell.isToday ? 'is-today' : '',
            ]
              .join(' ')
              .trim()}
            title={cell.date.toLocaleDateString('zh-CN')}
          >
            {cell.day}
          </span>
        ))}
      </div>
    </div>
  );
}

export default CalendarWidget;

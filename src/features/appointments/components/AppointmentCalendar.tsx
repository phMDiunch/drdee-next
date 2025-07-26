// src/features/appointments/components/AppointmentCalendar.tsx
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Tooltip, Popconfirm } from "antd";
import { useState } from "react";
import { formatDateTimeVN } from "@/utils/date";

// Nên để events dạng {id, title, start, end, ...}
type Props = {
  fetchEvents: (
    fetchInfo: { startStr: string; endStr: string },
    successCallback: (events: any[]) => void,
    failureCallback: (error: any) => void
  ) => void;
  onCreate?: (slot: { start: string; end: string }) => void;
  onEdit?: (event: any) => void;
  onDelete?: (eventId: string) => void;
  onChangeTime?: (event: any) => void;
};

export default function AppointmentCalendar({
  fetchEvents,
  onCreate,
  onEdit,
  onDelete,
  onChangeTime,
}: Props) {
  // Tooltip event chi tiết
  const [tooltipEvent, setTooltipEvent] = useState<any | null>(null);

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale="vi"
        events={fetchEvents}
        selectable
        editable
        eventResizableFromStart
        slotMinTime="08:00:00"
        slotMaxTime="19:00:00"
        height={650}
        // Tạo mới khi chọn range hoặc slot
        select={(info) => {
          if (onCreate)
            onCreate({
              start: info.startStr,
              end: info.endStr,
            });
        }}
        // Nhấn vào event để sửa/xoá
        eventClick={(info) => {
          if (onEdit) onEdit(info.event.extendedProps);
        }}
        // Kéo thả event để đổi thời gian
        eventDrop={(info) => {
          if (onChangeTime)
            onChangeTime({
              id: info.event.id,
              start: info.event.startStr,
              end: info.event.endStr,
            });
        }}
        // Kéo resize event
        eventResize={(info) => {
          if (onChangeTime)
            onChangeTime({
              id: info.event.id,
              start: info.event.startStr,
              end: info.event.endStr,
            });
        }}
        eventMouseEnter={(info) => setTooltipEvent(info.event)}
        eventMouseLeave={() => setTooltipEvent(null)}
      />

      {/* Tooltip chi tiết event */}
      {tooltipEvent && (
        <Tooltip
          open
          title={
            <div>
              <div>
                <b>{tooltipEvent.title}</b>
              </div>
              <div>
                {formatDateTimeVN(tooltipEvent.start, "HH:mm DD/MM/YYYY")}
                {tooltipEvent.end
                  ? ` - ${formatDateTimeVN(
                      tooltipEvent.end,
                      "HH:mm DD/MM/YYYY"
                    )}`
                  : ""}
              </div>
              <div>{tooltipEvent.extendedProps?.notes || ""}</div>
              {onDelete && (
                <Popconfirm
                  title="Xoá lịch hẹn này?"
                  onConfirm={() => onDelete(tooltipEvent.id)}
                >
                  <a style={{ color: "red" }}>Xoá</a>
                </Popconfirm>
              )}
            </div>
          }
          placement="top"
          getPopupContainer={() => document.body}
        >
          <span />
        </Tooltip>
      )}
    </>
  );
}

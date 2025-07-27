// src/features/appointments/components/AppointmentCalendar.tsx
"use client";

import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Tooltip, Popconfirm } from "antd";
import { formatDateTimeVN } from "@/utils/date";

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
  const calendarRef = useRef<HTMLDivElement>(null);

  // Hàm render nội dung cho mỗi event, bọc trong Tooltip
  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const { extendedProps } = event;

    const tooltipContent = (
      <div>
        <div>
          <b>{event.title}</b>
        </div>
        <div>{formatDateTimeVN(event.startStr)}</div>
        <div>{extendedProps?.notes || ""}</div>
        {onDelete && (
          <Popconfirm
            title="Xoá lịch hẹn này?"
            // Ngăn sự kiện click lan ra ngoài, tránh việc mở modal edit
            onConfirm={(e) => {
              e?.stopPropagation();
              onDelete(event.id);
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <a
              style={{
                color: "red",
                marginTop: "4px",
                display: "inline-block",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Xoá
            </a>
          </Popconfirm>
        )}
      </div>
    );

    return (
      <Tooltip
        title={tooltipContent}
        placement="top"
        // Gắn tooltip vào div chứa calendar để định vị chính xác
        getPopupContainer={() => calendarRef.current!}
      >
        <div className="fc-event-main-frame">
          <div className="fc-event-title-container">
            <div className="fc-event-title fc-sticky">{event.title}</div>
          </div>
        </div>
      </Tooltip>
    );
  };

  return (
    <div ref={calendarRef}>
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
        eventContent={renderEventContent} // <-- Sử dụng hàm render mới
        selectable
        editable
        eventResizableFromStart
        slotMinTime="08:00:00"
        slotMaxTime="19:00:00"
        height={650}
        select={(info) => {
          if (onCreate) onCreate({ start: info.startStr, end: info.endStr });
        }}
        eventClick={(info) => {
          if (onEdit) onEdit(info.event.extendedProps);
        }}
        eventDrop={(info) => {
          if (onChangeTime)
            onChangeTime({
              id: info.event.id,
              start: info.event.startStr,
              end: info.event.endStr,
            });
        }}
        eventResize={(info) => {
          if (onChangeTime)
            onChangeTime({
              id: info.event.id,
              start: info.event.startStr,
              end: info.event.endStr,
            });
        }}
      />
    </div>
  );
}

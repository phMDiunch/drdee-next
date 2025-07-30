// src/features/appointments/components/AppointmentCalendar.tsx
"use client";

import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Tooltip, Popconfirm } from "antd";
import { formatDateTimeVN } from "@/utils/date";
import dayjs from "dayjs";

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

    console.log("Event extendedProps:", extendedProps);

    const tooltipContent = (
      <div style={{ maxWidth: 300 }}>
        <div style={{ marginBottom: 4 }}>
          <b>{event.title}</b>
        </div>
        <div style={{ marginBottom: 4 }}>
          <strong>Khách hàng:</strong>{" "}
          {extendedProps?.customer?.fullName || "N/A"}
        </div>
        <div style={{ marginBottom: 4 }}>
          <strong>Thời gian:</strong>{" "}
          {formatDateTimeVN(event.start, "HH:mm DD/MM/YYYY")}
        </div>
        <div style={{ marginBottom: 4 }}>
          <strong>Thời lượng:</strong> {extendedProps?.duration || 30} phút
        </div>
        <div style={{ marginBottom: 4 }}>
          <strong>Bác sĩ chính:</strong>{" "}
          {extendedProps?.primaryDentist?.fullName || "N/A"}
        </div>
        {extendedProps?.secondaryDentist && (
          <div style={{ marginBottom: 4 }}>
            <strong>Bác sĩ phụ:</strong>{" "}
            {extendedProps.secondaryDentist.fullName}
          </div>
        )}
        <div style={{ marginBottom: 4 }}>
          <strong>Trạng thái:</strong> {extendedProps?.status || "N/A"}
        </div>
        {/* Sửa phần notes để luôn hiển thị */}
        <div style={{ marginBottom: 8 }}>
          <strong>Ghi chú:</strong> {extendedProps?.notes || "Không có ghi chú"}
        </div>
        {onDelete && (
          <Popconfirm
            title="Xoá lịch hẹn này?"
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
        eventContent={renderEventContent}
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
        // SỬA: Cập nhật chỉ thời gian khi drag
        eventDrop={async (info) => {
          console.log("🔄 Event dropped:", {
            id: info.event.id,
            oldStart: info.oldEvent.startStr,
            newStart: info.event.startStr,
          });

          if (onChangeTime) {
            try {
              await onChangeTime({
                id: info.event.id,
                start: info.event.startStr,
                appointmentDateTime: info.event.startStr,
              });
              console.log("✅ Drag successful");
            } catch (error) {
              console.error("❌ Drag failed:", error);
              info.revert();
            }
          }
        }}
        // SỬA: Cập nhật cả thời gian và duration khi resize
        eventResize={async (info) => {
          const start = dayjs(info.event.startStr);
          const end = dayjs(info.event.endStr);
          const newDuration = end.diff(start, "minute");

          console.log("📏 Event resized:", {
            id: info.event.id,
            oldDuration: info.oldEvent.extendedProps.duration,
            newDuration,
            start: info.event.startStr,
            end: info.event.endStr,
          });

          if (onChangeTime) {
            try {
              await onChangeTime({
                id: info.event.id,
                start: info.event.startStr,
                end: info.event.endStr,
                appointmentDateTime: info.event.startStr,
                duration: newDuration,
              });

              // ✅ CẬP NHẬT EXTENDED PROPS SAU KHI API THÀNH CÔNG
              info.event.setExtendedProp("duration", newDuration);
              info.event.setExtendedProp(
                "appointmentDateTime",
                info.event.startStr
              );

              console.log("✅ Resize successful, updated extendedProps:", {
                duration: info.event.extendedProps.duration,
                appointmentDateTime:
                  info.event.extendedProps.appointmentDateTime,
              });
            } catch (error) {
              console.error("❌ Resize failed:", error);
              info.revert();
            }
          }
        }}
      />
    </div>
  );
}

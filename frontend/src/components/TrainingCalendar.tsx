// TrainingCalendar.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getTrainingSessions } from '../services/api';
import { TrainingSession } from '../types';
import TrainingSessionDialog from './TrainingSessionDialog';

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

interface TrainingCalendarProps {
  isDarkMode: boolean;
}

const localizer = momentLocalizer(moment);

const TrainingCalendar: React.FC<TrainingCalendarProps> = ({ isDarkMode }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [refreshEvents, setRefreshEvents] = useState(false);

  useEffect(() => {
    fetchTrainingSessions();
  }, [refreshEvents]);

  const fetchTrainingSessions = async () => {
    try {
      const response = await getTrainingSessions();
      const sessions = response.data;
      let allEvents: CalendarEvent[] = [];
      sessions.forEach((session: TrainingSession) => {
        if (session.recurrence === 'weekly' && session.days_of_week) {
          const dayMapping: { [key: string]: number } = {
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
            Sunday: 0,
          };
          const daysOfWeek = session.days_of_week.split(',').map((day: string) => dayMapping[day]);

          // Generate events for the next 4 weeks
          const startDate = moment(session.date);
          const endDate = moment().add(4, 'weeks');
          let current = startDate.clone();
          while (current.isBefore(endDate)) {
            if (daysOfWeek.includes(current.day())) {
              const eventStart = moment(current.format('YYYY-MM-DD') + ' ' + session.time).toDate();
              allEvents.push({
                id: session.id,
                title: 'Training Session',
                start: eventStart,
                end: moment(eventStart).add(1, 'hour').toDate(), // assuming 1-hour sessions
              });
            }
            current.add(1, 'day');
          }
        } else {
          const eventStart = moment(session.date + ' ' + session.time).toDate();
          allEvents.push({
            id: session.id,
            title: 'Training Session',
            start: eventStart,
            end: moment(eventStart).add(1, 'hour').toDate(),
          });
        }
      });
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching training sessions:', error);
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedSlot({ start, end: start });
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setRefreshEvents(!refreshEvents);
  };

  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <Calendar
        localizer={localizer}
        events={events}
        selectable
        onSelectSlot={handleSelectSlot}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month', 'week', 'day']}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: isDarkMode ? '#1a202c' : '#3182ce',
            color: isDarkMode ? 'white' : 'white',
          },
        })}
      />
      {showDialog && selectedSlot && (
        <TrainingSessionDialog
          show={showDialog}
          onHide={handleDialogClose}
          initialDate={selectedSlot.start}
        />
      )}
    </div>
  );
};

export default TrainingCalendar;

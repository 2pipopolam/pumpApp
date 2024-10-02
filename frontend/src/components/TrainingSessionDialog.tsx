
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { createTrainingSession } from '../services/api';
import { TrainingSession } from '../types';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

interface TrainingSessionDialogProps {
  show: boolean;
  onHide: () => void;
  initialDate: Date;
}

const daysOfWeekOptions = [
  { value: 'Monday', label: 'Понедельник' },
  { value: 'Tuesday', label: 'Вторник' },
  { value: 'Wednesday', label: 'Среда' },
  { value: 'Thursday', label: 'Четверг' },
  { value: 'Friday', label: 'Пятница' },
  { value: 'Saturday', label: 'Суббота' },
  { value: 'Sunday', label: 'Воскресенье' },
];

const TrainingSessionDialog: React.FC<TrainingSessionDialogProps> = ({ show, onHide, initialDate }) => {
  const [date, setDate] = useState<Date | null>(initialDate);
  const [time, setTime] = useState<Date | null>(initialDate);
  const [recurrence, setRecurrence] = useState<string>('once');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleSave = async () => {
    if (date && time) {
      const dateStr = moment(date).format('YYYY-MM-DD');
      const timeStr = moment(time).format('HH:mm:ss');
      const data: Partial<TrainingSession> = {
        date: dateStr,
        time: timeStr,
        recurrence,
        days_of_week: selectedDays.join(','),
      };
      try {
        await createTrainingSession(data);
        onHide();
      } catch (error) {
        console.error('Error creating training session:', error);
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Создать тренировку</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label>Дата:</label>
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => setDate(date)}
            dateFormat="yyyy-MM-dd"
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Время:</label>
          <DatePicker
            selected={time}
            onChange={(time: Date | null) => setTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Время"
            dateFormat="HH:mm"
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Повторение:</label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="form-control"
          >
            <option value="once">Однократно</option>
            <option value="weekly">Еженедельно</option>
          </select>
        </div>
        {recurrence === 'weekly' && (
          <div className="mb-3">
            <label>Дни недели:</label>
            {daysOfWeekOptions.map((day) => (
              <div key={day.value}>
                <input
                  type="checkbox"
                  value={day.value}
                  checked={selectedDays.includes(day.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDays([...selectedDays, day.value]);
                    } else {
                      setSelectedDays(selectedDays.filter((d) => d !== day.value));
                    }
                  }}
                />
                <label className="ml-2">{day.label}</label>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TrainingSessionDialog;

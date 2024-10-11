// TrainingSessionDialog.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { createTrainingSession, updateTrainingSession, deleteTrainingSession } from '../services/api';
import { TrainingSession } from '../types';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

interface TrainingSessionDialogProps {
  show: boolean;
  onHide: () => void;
  initialDate?: Date;
  initialEvent?: CalendarEvent;
}

const TrainingSessionDialog: React.FC<TrainingSessionDialogProps> = ({ show, onHide, initialDate, initialEvent }) => {
  const [date, setDate] = useState<Date | null>(initialDate || new Date());
  const [time, setTime] = useState<Date | null>(initialDate || new Date());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (initialEvent) {
      setIsEditing(true);
      setDate(initialEvent.start);
      setTime(initialEvent.start);
    } else {
      setIsEditing(false);
    }
    setErrorMessage('');
  }, [initialEvent, show]);

  const handleSave = async () => {
    if (date && time) {
      const selectedDateTime = moment(date).set({
        hour: moment(time).hour(),
        minute: moment(time).minute(),
        second: 0,
        millisecond: 0,
      });

      const now = moment();

      if (selectedDateTime.isBefore(now)) {
        setErrorMessage('Нельзя назначить тренировку на прошедшее время.');
        return;
      }

      const dateStr = selectedDateTime.format('YYYY-MM-DD');
      const timeStr = selectedDateTime.format('HH:mm:ss');
      const data: Partial<TrainingSession> = {
        date: dateStr,
        time: timeStr,
      };
      try {
        if (isEditing && initialEvent) {
          await updateTrainingSession(initialEvent.id, data);
        } else {
          await createTrainingSession(data);
        }
        onHide();
      } catch (error) {
        console.error('Ошибка при сохранении тренировки:', error);
        setErrorMessage('Произошла ошибка при сохранении тренировки. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  const handleDelete = async () => {
    if (initialEvent) {
      try {
        await deleteTrainingSession(initialEvent.id);
        onHide();
      } catch (error) {
        console.error('Ошибка при удалении тренировки:', error);
        setErrorMessage('Произошла ошибка при удалении тренировки. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  // Функция для фильтрации доступного времени
  const filterPassedTime = (time: Date) => {
    const now = moment();
    const selectedDate = date ? moment(date).startOf('day') : moment().startOf('day');
    const selectedTime = moment(time);

    if (selectedDate.isSame(now, 'day')) {
      return selectedTime.isAfter(now);
    }
    return true;
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Редактировать тренировку' : 'Создать тренировку'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <div className="mb-3">
          <label>Дата:</label>
          <DatePicker
            selected={date}
            onChange={(selectedDate: Date | null) => {
              setDate(selectedDate);
            }}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            minDate={new Date()}
            placeholderText="Выберите дату"
          />
        </div>
        <div className="mb-3">
          <label>Время:</label>
          <DatePicker
            selected={time}
            onChange={(selectedTime: Date | null) => setTime(selectedTime)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Время"
            dateFormat="HH:mm"
            className="form-control"
            filterTime={filterPassedTime}
            placeholderText="Выберите время"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        {isEditing && (
          <Button variant="danger" onClick={handleDelete}>
            Удалить
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {isEditing ? 'Сохранить изменения' : 'Сохранить'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TrainingSessionDialog;

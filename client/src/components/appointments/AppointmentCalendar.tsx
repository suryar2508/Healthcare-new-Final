import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason?: string;
  notes?: string;
  patient?: {
    user: {
      fullName: string;
    }
  };
  doctor?: {
    user: {
      fullName: string;
    }
  };
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentSelect?: (appointment: Appointment) => void;
}

export default function AppointmentCalendar({ 
  appointments = [],
  onAppointmentSelect
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Get appointments for selected date
  const getAppointmentsForDate = (date: Date) => {
    if (!date) return [];

    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => {
      // Convert appointment date to yyyy-MM-dd for comparison
      const appointmentDateObj = new Date(appointment.appointmentDate);
      const appointmentDateString = format(appointmentDateObj, 'yyyy-MM-dd');
      return appointmentDateString === dateString;
    });
  };

  // Group appointments by time slots for the selected date
  const appointmentsForSelectedDate = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  // Handle calendar date change
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    if (onAppointmentSelect) {
      onAppointmentSelect(appointment);
    }
  };

  // Get days with appointments for highlighting in calendar
  const getDaysWithAppointments = () => {
    const days: Date[] = [];
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.appointmentDate);
      days.push(date);
    });
    
    return days;
  };

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Calendar day render function to highlight days with appointments
  const renderDay = (day: Date) => {
    const appointmentsOnDay = getAppointmentsForDate(day);
    const hasAppointments = appointmentsOnDay.length > 0;

    if (!hasAppointments) {
      return <div className="h-full w-full">{day.getDate()}</div>;
    }

    // Count appointments by status
    let scheduled = 0;
    let completed = 0;
    let cancelled = 0;

    appointmentsOnDay.forEach(app => {
      if (app.status === 'scheduled') scheduled++;
      else if (app.status === 'completed') completed++;
      else if (app.status === 'cancelled') cancelled++;
    });

    return (
      <div className="h-full w-full flex flex-col items-center">
        <div className="font-medium">{day.getDate()}</div>
        {hasAppointments && (
          <div className="flex space-x-0.5 mt-1">
            {scheduled > 0 && (
              <div className="status-indicator status-upcoming w-1.5 h-1.5"></div>
            )}
            {completed > 0 && (
              <div className="status-indicator status-completed w-1.5 h-1.5"></div>
            )}
            {cancelled > 0 && (
              <div className="status-indicator status-cancelled w-1.5 h-1.5"></div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              components={{
                day: ({ date, ...props }) => (
                  <div {...props}>
                    {renderDay(date)}
                  </div>
                ),
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              {selectedDate ? (
                `Appointments for ${format(selectedDate, 'MMMM d, yyyy')}`
              ) : (
                'Select a date to view appointments'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {appointmentsForSelectedDate.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-50 ${selectedAppointment?.id === appointment.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 flex-shrink-0">
                          <span className="material-icons">person</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {appointment.patient?.user?.fullName || 'Patient'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {appointment.reason || 'General Consultation'}
                          </p>
                          <div className="mt-1">
                            <Badge className={`text-xs ${getStatusColorClass(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span className="material-icons text-gray-400 mr-1 text-base">schedule</span>
                        {appointment.appointmentTime}
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Notes: </span>{appointment.notes}
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <button className="text-primary-600 text-xs font-medium flex items-center">
                        View details <span className="material-icons ml-1 text-xs">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <span className="material-icons text-gray-400 text-3xl mb-2">event_busy</span>
                <p className="text-gray-500">No appointments scheduled for this date.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

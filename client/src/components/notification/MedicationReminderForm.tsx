import React, { useState } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BellRing, Clock, Plus, X } from "lucide-react";
import { Separator } from '@/components/ui/separator';

interface Medication {
  id: string;
  name: string;
  time: string;
  days: string[];
  active: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

const MedicationReminderForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedication, setNewMedication] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

  // Add new medication reminder
  const addMedication = () => {
    if (!newMedication.trim()) {
      toast({
        title: 'Please enter a medication name',
        variant: 'destructive',
      });
      return;
    }
    
    const medication: Medication = {
      id: Date.now().toString(),
      name: newMedication,
      time: selectedTime,
      days: [...selectedDays],
      active: true,
    };
    
    setMedications([...medications, medication]);
    setNewMedication('');
  };

  // Remove medication reminder
  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  // Toggle medication reminder status
  const toggleMedication = (id: string) => {
    setMedications(
      medications.map(med => 
        med.id === id ? { ...med, active: !med.active } : med
      )
    );
  };

  // Save all medication reminders
  const saveRemindersMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const payload = {
        patientId: user.id,
        medications: medications.map(med => ({
          medicationName: med.name,
          time: med.time,
          days: med.days,
          active: med.active
        }))
      };
      
      const res = await apiRequest('POST', '/api/medication-reminders', payload);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Reminders Saved',
        description: 'Your medication reminders have been saved',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medication-reminders'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Select or deselect all days
  const handleSelectAllDays = (select: boolean) => {
    if (select) {
      setSelectedDays(DAYS_OF_WEEK.map(day => day.value));
    } else {
      setSelectedDays([]);
    }
  };

  // Toggle a specific day
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BellRing className="mr-2 h-5 w-5" /> Medication Reminders
        </CardTitle>
        <CardDescription>
          Set up reminders for your medications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new medication form */}
        <div className="space-y-4">
          <h3 className="font-medium">Add New Medication Reminder</h3>
          
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="medication-name">Medication Name</Label>
              <Input 
                id="medication-name" 
                placeholder="Enter medication name"
                value={newMedication}
                onChange={e => setNewMedication(e.target.value)}
              />
            </div>
            
            <div className="grid gap-1.5">
              <Label htmlFor="reminder-time">Reminder Time</Label>
              <Input 
                id="reminder-time" 
                type="time"
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
              />
            </div>
            
            <div className="grid gap-1.5">
              <Label>Days of Week</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <Button
                    key={day.value}
                    variant={selectedDays.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day.value)}
                    className="w-9 h-9 p-0 rounded-full"
                  >
                    {day.value.charAt(0).toUpperCase()}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectAllDays(true)}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectAllDays(false)}
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            <Button onClick={addMedication} className="mt-2">
              <Plus className="h-4 w-4 mr-1" /> Add Medication
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Medication list */}
        <div className="space-y-4">
          <h3 className="font-medium">Current Medication Reminders</h3>
          
          {medications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No medication reminders set up yet.</p>
          ) : (
            <div className="space-y-3">
              {medications.map(medication => (
                <div 
                  key={medication.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-background"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{medication.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{medication.time}</span>
                      <span className="mx-1">•</span>
                      <span>{medication.days.length === 7 ? 'Every day' : `${medication.days.length} days`}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={medication.active}
                      onCheckedChange={() => toggleMedication(medication.id)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeMedication(medication.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => saveRemindersMutation.mutate()}
          disabled={medications.length === 0 || saveRemindersMutation.isPending}
          className="w-full"
        >
          {saveRemindersMutation.isPending ? 'Saving...' : 'Save Reminders'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MedicationReminderForm;
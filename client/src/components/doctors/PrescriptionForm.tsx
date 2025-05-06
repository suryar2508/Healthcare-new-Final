import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DrugInteractionAlert from './DrugInteractionAlert';
import VitalSignsInput from './VitalSignsInput';

interface PrescriptionFormProps {
  doctorId: number;
}

export default function PrescriptionForm({ doctorId }: PrescriptionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [medications, setMedications] = useState([{ 
    medication: '', 
    dosage: '', 
    frequency: 'once_daily', 
    duration: '7 days' 
  }]);
  const [interactionAlert, setInteractionAlert] = useState<any>(null);
  
  // Fetch patients
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/patients', undefined);
      return await response.json();
    }
  });
  
  // Form handling
  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      patientId: '',
      diagnosis: '',
      instructions: '',
      followUpDate: '',
      vitalSigns: {
        bloodPressure: '',
        pulse: '',
        temperature: '',
        weight: ''
      }
    }
  });
  
  // Watch medication names for drug interaction checking
  const watchedMedications = watch();
  
  // Check for drug interactions when medications change
  useEffect(() => {
    const checkDrugInteractions = async () => {
      const medicationNames = medications.map(med => med.medication).filter(med => med.length > 0);
      
      if (medicationNames.length < 2) {
        setInteractionAlert(null);
        return;
      }
      
      try {
        const response = await apiRequest('POST', '/api/check-drug-interactions', { medications: medicationNames });
        const data = await response.json();
        
        if (data.interactions && data.interactions.length > 0) {
          setInteractionAlert(data.interactions[0]);
        } else {
          setInteractionAlert(null);
        }
      } catch (error) {
        console.error('Error checking drug interactions:', error);
      }
    };
    
    // Only check if we have medications entered
    const hasValidMedications = medications.some(med => med.medication.length > 2);
    if (hasValidMedications) {
      checkDrugInteractions();
    }
  }, [medications]);
  
  // Prescription submission mutation
  const prescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/prescriptions', data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Prescription Created',
        description: 'Prescription has been created and bill generated',
        variant: 'default',
      });
      
      reset();
      setMedications([{ medication: '', dosage: '', frequency: 'once_daily', duration: '7 days' }]);
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create prescription. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: any) => {
    // Only include medications that have a name
    const validMedications = medications.filter(med => med.medication.trim() !== '');
    
    if (validMedications.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one medication',
        variant: 'destructive',
      });
      return;
    }
    
    // Parse numeric values
    const vitalSigns = {
      ...data.vitalSigns,
      pulse: data.vitalSigns.pulse ? parseInt(data.vitalSigns.pulse, 10) : undefined,
      temperature: data.vitalSigns.temperature ? parseFloat(data.vitalSigns.temperature) : undefined,
      weight: data.vitalSigns.weight ? parseFloat(data.vitalSigns.weight) : undefined,
    };
    
    // Complete prescription data
    const prescriptionData = {
      ...data,
      doctorId,
      vitalSigns,
      items: validMedications,
    };
    
    prescriptionMutation.mutate(prescriptionData);
  };
  
  const addMedication = () => {
    setMedications([
      ...medications, 
      { medication: '', dosage: '', frequency: 'once_daily', duration: '7 days' }
    ]);
  };
  
  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      const updatedMedications = [...medications];
      updatedMedications.splice(index, 1);
      setMedications(updatedMedications);
    }
  };
  
  const updateMedication = (index: number, field: string, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = { 
      ...updatedMedications[index],
      [field]: value 
    };
    setMedications(updatedMedications);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
          <Controller
            control={control}
            name="patientId"
            rules={{ required: 'Patient is required' }}
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {!patientsLoading && patients?.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.patientId && (
            <p className="text-xs text-destructive mt-1">{errors.patientId.message as string}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
          <Input
            id="diagnosis"
            {...register('diagnosis', { required: 'Diagnosis is required' })}
            placeholder="Enter diagnosis"
            className="w-full"
          />
          {errors.diagnosis && (
            <p className="text-xs text-destructive mt-1">{errors.diagnosis.message as string}</p>
          )}
        </div>
      </div>
      
      <VitalSignsInput control={control} errors={errors} />
      
      <div>
        <h3 className="text-md font-medium mb-3">Medications</h3>
        
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg mb-4">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Medication</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dosage</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Frequency</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {medications.map((medication, index) => (
                <tr key={index} className="medication-row">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <Input
                      className="med-name w-full border-0 p-0 focus:ring-0"
                      placeholder="Medication name"
                      value={medication.medication}
                      onChange={(e) => updateMedication(index, 'medication', e.target.value)}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <Input
                      className="med-dosage w-full border-0 p-0 focus:ring-0"
                      placeholder="e.g. 10mg"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <Select 
                      value={medication.frequency}
                      onValueChange={(value) => updateMedication(index, 'frequency', value)}
                    >
                      <SelectTrigger className="w-full border-0 p-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once_daily">Once daily</SelectItem>
                        <SelectItem value="twice_daily">Twice daily</SelectItem>
                        <SelectItem value="three_times_daily">Three times daily</SelectItem>
                        <SelectItem value="four_times_daily">Four times daily</SelectItem>
                        <SelectItem value="as_needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <Input
                      className="med-duration w-full border-0 p-0 focus:ring-0"
                      placeholder="e.g. 7 days"
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    />
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeMedication(index)}
                    >
                      <span className="material-icons">delete</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMedication}
          className="mt-2 text-primary-700 bg-primary-100 hover:bg-primary-200 rounded-full"
        >
          <span className="material-icons text-sm mr-1">add</span>
          Add Medication
        </Button>
        
        {interactionAlert && (
          <DrugInteractionAlert interaction={interactionAlert} />
        )}
      </div>
      
      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
        <Textarea
          id="instructions"
          {...register('instructions')}
          rows={3}
          placeholder="Enter any special instructions or notes for the patient"
          className="w-full"
        />
      </div>
      
      <div>
        <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-1">Follow-up Appointment</label>
        <Input
          id="followUpDate"
          type="date"
          {...register('followUpDate')}
          className="w-full"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          className="px-4 py-2"
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          className="px-4 py-2"
          disabled={prescriptionMutation.isPending}
        >
          {prescriptionMutation.isPending ? 'Generating...' : 'Generate Prescription'}
        </Button>
      </div>
    </form>
  );
}

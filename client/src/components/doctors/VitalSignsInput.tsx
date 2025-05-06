import { Control, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';

interface VitalSignsInputProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function VitalSignsInput({ control, errors }: VitalSignsInputProps) {
  return (
    <div className="border rounded-md p-4 bg-gray-50">
      <h3 className="text-md font-medium mb-3">Vital Signs</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="bp" className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
          <Input
            id="bp"
            placeholder="e.g. 120/80"
            {...control.register('vitalSigns.bloodPressure', {
              pattern: {
                value: /^\d+\/\d+$/,
                message: 'Use format: 120/80'
              }
            })}
          />
          {errors.vitalSigns?.bloodPressure && (
            <p className="text-xs text-destructive mt-1">
              {errors.vitalSigns.bloodPressure.message as string}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="pulse" className="block text-sm font-medium text-gray-700 mb-1">Pulse</label>
          <Input
            id="pulse"
            type="number"
            placeholder="e.g. 72"
            {...control.register('vitalSigns.pulse', {
              valueAsNumber: true,
              validate: value => !value || (value > 0 && value < 300) || 'Invalid pulse rate'
            })}
          />
          {errors.vitalSigns?.pulse && (
            <p className="text-xs text-destructive mt-1">
              {errors.vitalSigns.pulse.message as string}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="temp" className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
          <Input
            id="temp"
            type="number"
            step="0.1"
            placeholder="e.g. 98.6"
            {...control.register('vitalSigns.temperature', {
              valueAsNumber: true,
              validate: value => !value || (value > 90 && value < 110) || 'Invalid temperature'
            })}
          />
          {errors.vitalSigns?.temperature && (
            <p className="text-xs text-destructive mt-1">
              {errors.vitalSigns.temperature.message as string}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="e.g. 70"
            {...control.register('vitalSigns.weight', {
              valueAsNumber: true,
              validate: value => !value || (value > 0 && value < 500) || 'Invalid weight'
            })}
          />
          {errors.vitalSigns?.weight && (
            <p className="text-xs text-destructive mt-1">
              {errors.vitalSigns.weight.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

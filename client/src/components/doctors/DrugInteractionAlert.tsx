interface DrugInteractionAlertProps {
  interaction: {
    drugA: string;
    drugB: string;
    severity: string;
    description: string;
    effect?: string;
  };
}

export default function DrugInteractionAlert({ interaction }: DrugInteractionAlertProps) {
  // Determine background color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'moderate':
        return 'bg-amber-50 border-amber-500 text-amber-800';
      case 'mild':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      default:
        return 'bg-amber-50 border-amber-500 text-amber-800';
    }
  };

  const severityColor = getSeverityColor(interaction.severity);
  
  return (
    <div className={`p-4 ${severityColor} border-l-4 rounded-md mt-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="material-icons text-amber-500">warning</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            Potential Drug Interaction Detected ({interaction.severity})
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              There may be interactions between <span className="font-semibold">{interaction.drugA}</span> and{' '}
              <span className="font-semibold">{interaction.drugB}</span>.
            </p>
            <p className="mt-1">{interaction.description}</p>
            {interaction.effect && <p className="mt-1">Effect: {interaction.effect}</p>}
          </div>
          <div className="mt-2">
            <button type="button" className="text-amber-800 hover:text-amber-900 text-xs font-medium">
              View detailed information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

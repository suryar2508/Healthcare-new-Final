import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Apple, X } from "lucide-react";

// Food item interface
interface FoodItem {
  name: string;
  benefits: string;
  description: string;
  image?: string;
  category: 'fruits' | 'vegetables' | 'grains' | 'protein' | 'dairy' | 'other';
}

// Health conditions with their recommended foods
const healthConditionFoods: Record<string, FoodItem[]> = {
  diabetes: [
    {
      name: 'Leafy Greens',
      benefits: 'Low in calories, high in nutrients, low glycemic index',
      description: 'Spinach, kale, and collard greens are excellent sources of vitamins and minerals with minimal impact on blood sugar levels.',
      category: 'vegetables',
    },
    {
      name: 'Fatty Fish',
      benefits: 'Rich in omega-3 fatty acids, high-quality protein',
      description: 'Salmon, mackerel, and sardines can help reduce inflammation and improve heart health, which is important for people with diabetes.',
      category: 'protein',
    },
    {
      name: 'Whole Grains',
      benefits: 'High in fiber, helps maintain blood sugar levels',
      description: 'Quinoa, brown rice, and oats contain complex carbohydrates that are digested more slowly, preventing spikes in blood sugar.',
      category: 'grains',
    }
  ],
  hypertension: [
    {
      name: 'Berries',
      benefits: 'Rich in antioxidants, low in sodium',
      description: 'Blueberries, strawberries, and raspberries contain flavonoids that can help lower blood pressure and improve vascular function.',
      category: 'fruits',
    },
    {
      name: 'Bananas',
      benefits: 'High in potassium, helps counteract sodium effects',
      description: 'Bananas are a great source of potassium, which helps your kidneys remove sodium through your urine, lowering blood pressure.',
      category: 'fruits',
    },
    {
      name: 'Greek Yogurt',
      benefits: 'Rich in calcium and vitamin D, low in salt',
      description: 'Greek yogurt is an excellent option for promoting lower blood pressure and improving overall heart health.',
      category: 'dairy',
    }
  ],
  cholesterol: [
    {
      name: 'Oats',
      benefits: 'Contains beta-glucan, helps reduce LDL cholesterol',
      description: 'Oatmeal contains soluble fiber that can lower your "bad" LDL cholesterol and total cholesterol levels.',
      category: 'grains',
    },
    {
      name: 'Avocados',
      benefits: 'Rich in healthy monounsaturated fats, may help increase HDL',
      description: 'Avocados can help increase your "good" HDL cholesterol while lowering your "bad" LDL cholesterol.',
      category: 'fruits',
    },
    {
      name: 'Nuts',
      benefits: 'Contains plant sterols and healthy fats',
      description: 'Almonds, walnuts, and other nuts can improve cholesterol levels and provide healthy fats that benefit heart health.',
      category: 'protein',
    }
  ],
  obesity: [
    {
      name: 'Bell Peppers',
      benefits: 'Very low in calories, high in fiber and water content',
      description: 'Bell peppers are rich in vitamins and antioxidants while being low in calories, making them perfect for weight management.',
      category: 'vegetables',
    },
    {
      name: 'Lentils',
      benefits: 'High in protein and fiber, promotes fullness',
      description: 'Lentils are an excellent plant-based protein source that helps you feel full longer and stabilizes blood sugar.',
      category: 'protein',
    },
    {
      name: 'Greek Yogurt',
      benefits: 'High in protein, low in sugar, promotes satiety',
      description: 'Greek yogurt is filling and protein-rich, which can help control appetite and support weight management goals.',
      category: 'dairy',
    }
  ],
  general: [
    {
      name: 'Blueberries',
      benefits: 'Rich in antioxidants, supports brain health',
      description: 'Blueberries contain powerful antioxidants that protect cells from damage and may improve memory and cognitive function.',
      category: 'fruits',
    },
    {
      name: 'Broccoli',
      benefits: 'High in fiber, vitamins, and anti-inflammatory compounds',
      description: 'Broccoli is packed with nutrients that support detoxification, immune function, and overall health.',
      category: 'vegetables',
    },
    {
      name: 'Sweet Potatoes',
      benefits: 'Rich in fiber, vitamins, and complex carbohydrates',
      description: 'Sweet potatoes provide sustainable energy and are loaded with vitamins A and C to support immune function.',
      category: 'vegetables',
    }
  ]
};

export default function FoodRecommendations() {
  const { user } = useAuth();
  const [activeCondition, setActiveCondition] = useState<string>('general');
  
  // Query to get patient's health conditions
  const { data: patientData, isLoading } = useQuery({
    queryKey: ['/api/patients/health-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await apiRequest('GET', `/api/patients/health-profile/${user.id}`);
      return await res.json();
    },
    enabled: !!user?.id
  });
  
  // Determine which health conditions the patient has
  const patientConditions = () => {
    if (!patientData) return ['general'];
    
    const conditions: string[] = [];
    
    if (patientData.isDiabetic) conditions.push('diabetes');
    if (patientData.hasHypertension) conditions.push('hypertension');
    if (patientData.hasHighCholesterol) conditions.push('cholesterol');
    if (patientData.bmi && patientData.bmi >= 30) conditions.push('obesity');
    
    // Always include general recommendations
    conditions.push('general');
    
    return conditions;
  };
  
  // Get the food recommendations for the active condition
  const recommendedFoods = healthConditionFoods[activeCondition] || healthConditionFoods.general;
  
  // Get color based on food category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fruits': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'vegetables': return 'bg-green-50 border-green-200 text-green-700';
      case 'grains': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'protein': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'dairy': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Diet Recommendations</CardTitle>
        <CardDescription>
          Personalized food suggestions based on your health profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Tabs value={activeCondition} onValueChange={setActiveCondition}>
              <TabsList className="mb-4 w-full grid grid-cols-2 lg:grid-cols-3 h-auto">
                {patientConditions().map((condition) => (
                  <TabsTrigger key={condition} value={condition} className="capitalize">
                    {condition === 'general' ? 'Overall Health' : condition}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {patientConditions().map((condition) => (
                <TabsContent key={condition} value={condition}>
                  <div className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                      {healthConditionFoods[condition].map((food, index) => (
                        <div 
                          key={index} 
                          className={`border rounded-lg p-4 ${getCategoryColor(food.category)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{food.name}</h4>
                            <Apple className="h-4 w-4" />
                          </div>
                          <p className="text-xs font-medium mb-2">{food.benefits}</p>
                          <p className="text-xs">{food.description}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      <p>Always consult with your healthcare provider before making significant changes to your diet.</p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
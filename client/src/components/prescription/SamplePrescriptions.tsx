import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileCheck, ExternalLink } from "lucide-react";

// Array of sample prescription images with metadata
const samplePrescriptions = [
  {
    id: 1,
    title: "Simple Antibiotic Prescription",
    description: "Basic prescription for Amoxicillin with clear dosage instructions",
    doctor: "Dr. Sarah Johnson",
    hospital: "General Medical Center",
    medications: ["Amoxicillin 500mg"],
    imageUrl: "https://i.imgur.com/VmvK86r.jpg" // You'll need to prepare and host these images
  },
  {
    id: 2,
    title: "Multiple Medication Prescription",
    description: "Multiple medications with detailed instructions and dosages",
    doctor: "Dr. Michael Chen",
    hospital: "Primary Care Associates",
    medications: ["Lisinopril 20mg", "Metformin 500mg", "Atorvastatin 10mg"],
    imageUrl: "https://i.imgur.com/aXeEGv5.jpg"
  },
  {
    id: 3,
    title: "Diabetes Management Prescription",
    description: "Insulin and diabetes medications with monitoring instructions",
    doctor: "Dr. Rachel Torres",
    hospital: "Endocrinology Clinic",
    medications: ["Insulin Glargine", "Metformin 1000mg"],
    imageUrl: "https://i.imgur.com/VLfKMZk.jpg"
  },
  {
    id: 4,
    title: "Pain Management Prescription",
    description: "Post-surgery pain management with controlled substances",
    doctor: "Dr. James Wilson",
    hospital: "Orthopedic Specialists",
    medications: ["Hydrocodone 5mg", "Ibuprofen 800mg"],
    imageUrl: "https://i.imgur.com/9XcWjp8.jpg"
  },
  {
    id: 5,
    title: "Cardiac Medication Prescription",
    description: "Heart medications with monitoring instructions",
    doctor: "Dr. Elizabeth Patel",
    hospital: "Cardiology Center",
    medications: ["Metoprolol 50mg", "Aspirin 81mg", "Furosemide 20mg"],
    imageUrl: "https://i.imgur.com/klQu9hr.jpg"
  },
  {
    id: 6,
    title: "Asthma Management Prescription",
    description: "Inhalers and oral medications for asthma control",
    doctor: "Dr. Anthony Kim",
    hospital: "Pulmonary Specialists",
    medications: ["Albuterol Inhaler", "Fluticasone Inhaler", "Montelukast 10mg"],
    imageUrl: "https://i.imgur.com/oH3Vz5T.jpg"
  },
  {
    id: 7,
    title: "Antibiotic Combination Prescription",
    description: "Multiple antibiotics for complex infection",
    doctor: "Dr. Maria Rodriguez",
    hospital: "Infectious Disease Clinic",
    medications: ["Ciprofloxacin 500mg", "Metronidazole 500mg"],
    imageUrl: "https://i.imgur.com/Rj8fM9C.jpg"
  },
  {
    id: 8,
    title: "Pediatric Prescription",
    description: "Child-appropriate dosages and formulations",
    doctor: "Dr. Benjamin Harper",
    hospital: "Children's Medical Group",
    medications: ["Amoxicillin 250mg/5ml suspension", "Cetirizine 5mg"],
    imageUrl: "https://i.imgur.com/wpT8kDa.jpg"
  },
  {
    id: 9,
    title: "Allergy Management Prescription",
    description: "Medications for severe allergies including EpiPen",
    doctor: "Dr. Sarah Williams",
    hospital: "Allergy & Immunology Center",
    medications: ["Epinephrine Auto-Injector", "Prednisone 10mg", "Cetirizine 10mg"],
    imageUrl: "https://i.imgur.com/gTkURxZ.jpg"
  },
  {
    id: 10,
    title: "Mental Health Prescription",
    description: "Medications for anxiety and depression management",
    doctor: "Dr. Thomas Bennett",
    hospital: "Behavioral Health Services",
    medications: ["Escitalopram 10mg", "Alprazolam 0.5mg"],
    imageUrl: "https://i.imgur.com/RtA3xm6.jpg"
  }
];

// Function to download an image from URL
const downloadImage = (url: string, title: string) => {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `prescription-${title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    })
    .catch(error => console.error('Error downloading image:', error));
};

const SamplePrescriptions: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCheck className="mr-2 h-5 w-5" /> Sample Prescriptions
        </CardTitle>
        <CardDescription>
          Download these sample prescriptions to test the OCR analysis functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prescription</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Medications</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {samplePrescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{prescription.title}</p>
                    <p className="text-xs text-muted-foreground">{prescription.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{prescription.doctor}</p>
                    <p className="text-xs text-muted-foreground">{prescription.hospital}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <ul className="list-disc list-inside text-sm">
                    {prescription.medications.map((med, index) => (
                      <li key={index}>{med}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => downloadImage(prescription.imageUrl, prescription.title)}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(prescription.imageUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        These are sample prescriptions for testing purposes only. Upload them to test the AI analysis feature.
      </CardFooter>
    </Card>
  );
};

export default SamplePrescriptions;
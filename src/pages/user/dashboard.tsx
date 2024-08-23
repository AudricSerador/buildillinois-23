import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/layout/auth.service";
import { useRouter } from 'next/router';
import { FaInfo, FaUtensils, FaMapMarkerAlt, FaWeight, FaCamera, FaStar, FaEdit, FaSpinner } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { dietaryPreferences, allergens, locationPreferences } from "@/components/icon_legend";
import Image from 'next/image';

type Option = { value: string; label: string };

export default function Dashboard(): JSX.Element {
  const [name, setName] = useState('');
  const router = useRouter();
  const { user, handleUserSignedIn } = useAuth();
  const [editSection, setEditSection] = useState('');
  const [editedValues, setEditedValues] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user && user.isNew) {
      router.push('/user/onboarding');
    } else if (user === null) {
      router.push('/login');
    } else {
      setName(user.name);
    }
  }, [user, router]);

  const handleEdit = (section: string) => {
    if (user) {
      setEditSection(section);
      setEditedValues(user[section as keyof typeof user] ? (user[section as keyof typeof user] as string).split(',') : []);
      setIsDialogOpen(true);
    }
  };

  const handleRemove = (item: string) => {
    setEditedValues(editedValues.filter(v => v !== item));
  };

  const handleAdd = (item: string) => {
    if (!editedValues.includes(item)) {
      setEditedValues([...editedValues, item]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/update_user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          [editSection]: editedValues.join(','),
        }),
      });
      if (response.ok) {
        await handleUserSignedIn(); // This will fetch the updated user data
        setIsDialogOpen(false);
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleDialogClosed = () => {
    if (!isDialogOpen) {
      setEditSection('');
      setEditedValues([]);
    }
  };

  const renderPreferences = (preferences: string | undefined, title: string, icon: React.ReactNode, section: string) => (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {preferences && preferences.length > 0 ? (
            preferences.split(',').map((item, index) => (
              <span key={index} className="badge badge-secondary flex items-center gap-1">
                {(section === 'allergies' || section === 'preferences') && (
                  <Image src={`/images/icons/${item.trim().toLowerCase()}.svg`} alt={item.trim()} width={16} height={16} />
                )}
                {item.trim()}
              </span>
            ))
          ) : (
            <p>No {title.toLowerCase()} set.</p>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
        <FaEdit className="mr-2" /> Edit
      </Button>
    </div>
  );

  const getOptionsForSection = (section: string): Option[] => {
    switch (section) {
      case 'allergies':
        return allergens.map(({ label }) => ({ value: label, label }));
      case 'preferences':
        return dietaryPreferences.map(({ label }) => ({ value: label, label }));
      case 'locations':
        return locationPreferences.map(({ label }) => ({ value: label, label }));
      case 'goal':
        return [];
      default:
        return [];
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Hello, {name}!</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          {renderPreferences(user?.allergies, "Allergies", <FaUtensils className="text-red-500" />, "allergies")}
          {renderPreferences(user?.preferences, "Dietary Restrictions", <FaUtensils className="text-green-500" />, "preferences")}
          {renderPreferences(user?.locations, "Location Preferences", <FaMapMarkerAlt className="text-blue-500" />, "locations")}
          {renderPreferences(user?.goal, "Dietary Goal", <FaWeight className="text-purple-500" />, "goal")}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaCamera className="text-yellow-500 mr-2" />
              Your Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You haven&apos;t uploaded any photos yet.</p>    
            <Button className="mt-4">Upload a Photo</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaStar className="text-yellow-500 mr-2" />
              Your Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You haven&apos;t written any reviews yet.</p>
            <Button className="mt-4">Write a Review</Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) handleDialogClosed();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editSection}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-wrap gap-2">
            {editedValues.length > 0 ? (
              editedValues.map((item, index) => (
                <span key={index} className="badge badge-secondary flex items-center gap-1">
                  {(editSection === 'allergies' || editSection === 'preferences') && (
                    <Image src={`/images/icons/${item.toLowerCase()}.svg`} alt={item} width={16} height={16} />
                  )}
                  {item}
                  <button className="btn btn-ghost btn-xs" onClick={() => handleRemove(item)}>×</button>
                </span>
              ))
            ) : (
              <p>No {editSection} selected.</p>
            )}
          </div>
          <Separator className="my-4" />
          <div className="mt-4 flex flex-wrap gap-2">
            {getOptionsForSection(editSection).map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                onClick={() => handleAdd(option.label)}
                className="flex items-center gap-1"
                disabled={editedValues.includes(option.label)}
              >
                {(editSection === 'allergies' || editSection === 'preferences') && (
                  <Image src={`/images/icons/${option.label.toLowerCase()}.svg`} alt={option.label} width={16} height={16} />
                )}
                {option.label}
              </Button>
            ))}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
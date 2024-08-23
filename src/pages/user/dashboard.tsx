import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/layout/auth.service";
import { useRouter } from 'next/router';
import { FaInfo, FaUtensils, FaMapMarkerAlt, FaWeight, FaEdit, FaSpinner, FaSignOutAlt, FaBell, FaLeaf, FaDumbbell, FaHeart } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { dietaryPreferences, allergens, locationPreferences } from "@/components/icon_legend";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';

type Option = { value: string; label: string };

const dietaryGoals = [
  {
    id: 'eat_healthy',
    title: 'Eat Healthy',
    description: 'Balance nutrients, focus on whole foods',
    icon: <FaLeaf className="text-green-500" />,
    color: 'bg-green-100 border-green-300',
  },
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'High protein, fiber-rich, calorie deficit',
    icon: <FaWeight className="text-blue-500" />,
    color: 'bg-blue-100 border-blue-300',
  },
  {
    id: 'bulk',
    title: 'Bulk',
    description: 'High protein, calorie surplus for muscle gain',
    icon: <FaDumbbell className="text-red-500" />,
    color: 'bg-red-100 border-red-300',
  },
];

export default function Dashboard(): JSX.Element {
  const [name, setName] = useState('');
  const router = useRouter();
  const { user, handleUserSignedIn, signOut } = useAuth();
  const [editSection, setEditSection] = useState('');
  const [editedValues, setEditedValues] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  useEffect(() => {
    if (user && user.isNew) {
      router.push('/user/onboarding');
    } else if (user === null) {
      router.push('/login');
    } else {
      setName(user.name);
      checkPushNotificationStatus();
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

  const handleSignOut = async () => {
    await signOut();
  };

  const renderGoalCards = (clickHandler: (goal: string) => void) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {dietaryGoals.map((goal) => (
        <Button
          key={goal.id}
          variant="outline"
          className={`h-auto flex flex-col items-start p-4 ${goal.color}`}
          onClick={() => clickHandler(goal.id)}
        >
          <div className="flex items-center mb-2">
            {goal.icon}
            <span className="ml-2 font-semibold">{goal.title}</span>
          </div>
          <p className="text-sm text-left">{goal.description}</p>
        </Button>
      ))}
    </div>
  );

  const handleGoalSelect = (goal: string) => {
    setEditedValues([goal]);
    handleSave();
  };

  const renderPreferences = (preferences: string | undefined, title: string, icon: React.ReactNode, section: string) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold flex items-center mb-2">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      {section === 'goal' ? (
        <div className="flex justify-between items-center">
          <div className="mt-2">
            {preferences ? (
              <div className={`inline-flex items-center p-2 rounded ${dietaryGoals.find(g => g.id === preferences)?.color}`}>
                {dietaryGoals.find(g => g.id === preferences)?.icon}
                <span className="ml-2 font-semibold">{dietaryGoals.find(g => g.id === preferences)?.title}</span>
              </div>
            ) : (
              <p>No dietary goal set.</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
            <FaEdit className="mr-2" /> Edit
          </Button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="mt-2 flex flex-wrap gap-2">
            {preferences && preferences.length > 0 ? (
              preferences.split(',').map((item, index) => (
                <span key={index} className="badge badge-info text-white flex items-center gap-1">
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
          <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
            <FaEdit className="mr-2" /> Edit
          </Button>
        </div>
      )}
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

  const checkPushNotificationStatus = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/get_subscription?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPushNotifications(data.hasSubscription);
      }
    } catch (error) {
      console.error('Error checking push notification status:', error);
    }
  };

  const handlePushNotificationToggle = async (checked: boolean) => {
    if (!user) return;
    if (checked) {
      await subscribeToNotifications(user.id);
    } else {
      await unsubscribeFromNotifications(user.id);
    }
    setPushNotifications(checked);
  };

  const subscribeToNotifications = async (userId: string) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, userId }),
      });

      if (response.ok) {
        console.log('Subscription successful');
      } else {
        console.error('Subscription failed');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  };

  const unsubscribeFromNotifications = async (userId: string) => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 sm:py-8 sm:px-32">
      <h1 className="text-4xl font-custombold mb-8">Profile</h1>
      
      <Card className="mb-8">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-6">
              <h2 className="text-2xl font-semibold">{name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Filters</CardTitle>
        </CardHeader>
        <CardContent>
          {renderPreferences(user?.allergies, "Allergies", <FaUtensils className="text-red-500" />, "allergies")}
          {renderPreferences(user?.preferences, "Dietary Restrictions", <FaUtensils className="text-green-500" />, "preferences")}
          {renderPreferences(user?.locations, "Location Preferences", <FaMapMarkerAlt className="text-blue-500" />, "locations")}
          {renderPreferences(user?.goal, "Dietary Goal", <FaWeight className="text-purple-500" />, "goal")}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaHeart className="text-red-500 mr-2" />
            Favorites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="font-medium">Your Favorite Items</span>
              <span className="text-sm text-gray-500">View and manage your saved food items</span>
            </div>
            <Link href="/user/favorites" passHref>
              <Button variant="outline">
                View Favorites
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaBell className="text-yellow-500 mr-2" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="font-medium">Push Notifications</span>
              <span className="text-sm text-gray-500">Receive updates on your device</span>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={handlePushNotificationToggle}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) handleDialogClosed();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editSection}</DialogTitle>
          </DialogHeader>
          {editSection === 'goal' ? (
            renderGoalCards(handleGoalSelect)
          ) : (
            <>
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
            </>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            {editSection !== 'goal' && (
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
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
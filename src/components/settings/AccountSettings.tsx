import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export function AccountSettings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-full">
      <div className="fixed top-0 left-12 w-64 h-full bg-zinc-900 border-r border-zinc-700/50 z-40">
        <div className="p-6 border-b border-zinc-700/50">
          <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
        </div>
      </div>
      <div className="flex-1 ml-64 bg-zinc-900 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-zinc-100">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-zinc-700 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-zinc-100">Sign Out</h3>
                  <p className="text-sm text-zinc-400">Sign out of your account</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-800 border-zinc-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-zinc-100">Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        This will sign you out of your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleSignOut}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Sign Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
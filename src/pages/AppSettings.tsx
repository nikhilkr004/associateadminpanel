import React, { useState, useEffect } from 'react';
import { db, storage } from '@/services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Save, Upload, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

export default function AppSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [existingIconUrl, setExistingIconUrl] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState('');
  
  const [zegoAppId, setZegoAppId] = useState('');
  const [zegoAppSign, setZegoAppSign] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // UI State
  const [showZegoSign, setShowZegoSign] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Load existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const snap = await getDoc(doc(db, "app_config", "settings"));
        if (snap.exists()) {
          const data = snap.data();
          setZegoAppId(data.zegoAppId?.toString() || "");
          setZegoAppSign(data.zegoAppSign || "");
          setGeminiApiKey(data.geminiApiKey || "");
          setExistingIconUrl(data.appIconUrl || "");
          setIconPreviewUrl(data.appIconUrl || "");
        }
      } catch (error) {
        console.error("Error fetching app settings:", error);
        toast({
          title: "Error Loading Settings",
          description: "Could not load existing settings from Firebase.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let appIconUrl = existingIconUrl;

      // 1. Upload new icon if selected
      if (iconFile) {
        const storageRef = ref(storage, "app_config/icon/app_icon.png");
        await uploadBytes(storageRef, iconFile);
        appIconUrl = await getDownloadURL(storageRef);
        setExistingIconUrl(appIconUrl); // Update local state so it doesn't try to reupload
      }

      // 2. Map payload (Note: zegoAppId must be Number explicitly per requirements)
      const payload = {
        appIconUrl: appIconUrl,
        zegoAppId: zegoAppId ? Number(zegoAppId) : 0, 
        zegoAppSign: zegoAppSign.trim(),
        geminiApiKey: geminiApiKey.trim(),
        lastUpdated: serverTimestamp()
      };

      // 3. Save to Firestore
      await setDoc(doc(db, "app_config", "settings"), payload, { merge: true });

      toast({
        title: "Settings Saved",
        description: "App settings have been successfully updated.",
      });

      // Cleanup object URL
      if (iconFile && iconPreviewUrl) {
         // Keep existing preview, but reset file state to prevent re-uploading the same file on next save
         setIconFile(null); 
      }

    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error Saving Settings",
        description: error.message || "An unknown error occurred while saving.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SlidersHorizontal className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">App Settings</h1>
          <p className="text-muted-foreground text-sm">Configure core app integrations and appearance</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ImageIcon className="w-5 h-5" /> Brand Assets
          </CardTitle>
          <CardDescription>
            Update the application icon displayed in the interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col sm:flex-row gap-6 items-start">
             <div className="flex flex-col gap-2 w-full max-w-sm">
                <Label htmlFor="iconUpload">App Icon File (.png recommended)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="iconUpload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleIconChange}
                    className="cursor-pointer"
                  />
                </div>
             </div>
             
             {/* Preview Area */}
             <div className="mt-4 sm:mt-0 relative flex-shrink-0">
               <Label className="block mb-2 text-muted-foreground">Preview</Label>
               <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden relative group">
                  {iconPreviewUrl ? (
                    <img src={iconPreviewUrl} alt="App Icon Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  )}
                  {iconFile && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  )}
               </div>
             </div>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Integrations & API Keys</CardTitle>
          <CardDescription>
            Configure keys for video calling (ZegoCloud) and AI features (Gemini). Note: Your app may need a restart to pick up these changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* ZegoCloud App ID */}
            <div className="space-y-2">
              <Label htmlFor="zegoAppId">ZegoCloud App ID (Number)</Label>
              <Input
                id="zegoAppId"
                type="number"
                placeholder="e.g. 243845632"
                value={zegoAppId}
                onChange={(e) => setZegoAppId(e.target.value)}
              />
            </div>

            {/* ZegoCloud App Sign */}
            <div className="space-y-2">
              <Label htmlFor="zegoAppSign">ZegoCloud App Sign</Label>
              <div className="relative">
                <Input
                  id="zegoAppSign"
                  type={showZegoSign ? "text" : "password"}
                  placeholder="Enter App Sign string"
                  value={zegoAppSign}
                  onChange={(e) => setZegoAppSign(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowZegoSign(!showZegoSign)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showZegoSign ? "Hide App Sign" : "Show App Sign"}
                >
                  {showZegoSign ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Gemini API Key */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="geminiApiKey">Google Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="geminiApiKey"
                  type={showGeminiKey ? "text" : "password"}
                  placeholder="Enter Gemini API Key"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showGeminiKey ? "Hide API Key" : "Show API Key"}
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 pt-6 border-t mt-4 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 w-full sm:w-auto min-w-[120px]">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

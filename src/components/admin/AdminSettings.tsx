import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Mail, User, Phone, Save } from "lucide-react";
import { supabase } from "../../services/api";

import settingsBanner from "../admin/imagess/settings.png";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) {
          toast.error("Unable to load your account");
          setLoading(false);
          return;
        }

        const loggedInUser = authData.user;

        // Fetch from app_users
        const { data: userData } = await supabase
          .from("app_users")
          .select("name, phone, email")
          .eq("id", loggedInUser.id)
          .single();

        setProfile({
          name: userData?.name || loggedInUser.user_metadata?.name || "",
          email: userData?.email || loggedInUser.email,
          phone: userData?.phone || "",
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("app_users")
        .update({
          name: profile.name,
          phone: profile.phone,
        })
        .eq("email", profile.email);

      if (error) throw error;

      // Also update auth user metadata for consistency
      await supabase.auth.updateUser({
        data: {
          name: profile.name,
          phone: profile.phone,
        },
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    }
  };

  if (loading)
    return <div className="p-10 text-center text-white">Loading...</div>;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${settingsBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90"></div>
      </div>

      <div className="relative z-20 h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-[#FFD700]">
            Profile Settings
          </h1>
          <p className="text-white/80 mt-1 font-poppins">
            Update your personal details & account information
          </p>
        </motion.div>

        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-6 sm:p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
            <h2 className="font-playfair text-2xl font-bold text-[#FFD700] mb-6">
              Account Information
            </h2>

            <form onSubmit={handleProfileSave} className="space-y-6">
              {/* FORM FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <Label className="text-white font-semibold text-sm">
                    Full Name
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <User className="w-4 h-4 text-white/60" />
                    <Input
                      className="bg-white/10 text-white border-white/20 placeholder-white/40"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label className="text-white font-semibold text-sm">
                    Email
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="w-4 h-4 text-white/60" />
                    <Input
                      value={profile.email}
                      disabled
                      className="bg-white/10 text-white border-white/20"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-white font-semibold text-sm">
                    Phone Number
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-4 h-4 text-white/60" />
                    <Input
                      className="bg-white/10 text-white border-white/20 placeholder-white/40"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      placeholder="Add phone"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button
                type="submit"
                className="bg-[#FFD700] hover:bg-[#e2c200] text-black font-semibold px-6 py-2"
              >
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

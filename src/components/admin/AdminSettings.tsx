import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { toast } from "sonner";
import { Mail, User, Phone, Save } from "lucide-react";
import { supabase } from "../../services/api";
import settingsBanner from "../admin/imagess/settings.png";
import React from "react";

import { getSession, getAllUsers } from "../../utils/authLocal";

export default function AdminSettings() {
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Fetch logged-in user info (LocalStorage first → Google fallback)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 🔹 1) LOCAL USER CHECK
        const localUser = getSession();

        if (localUser) {
          setIsGoogleUser(false);

          setProfile({
            name: localUser.name,
            email: localUser.email,
            phone: "", // local users don't have phone
          });

          setLoading(false);
          return;
        }

        // 🔹 2) GOOGLE USER CHECK
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          toast.error("No account found");
          setLoading(false);
          return;
        }

        setIsGoogleUser(true);

        const metadata = user.user_metadata || {};
        const fullName =
          metadata.full_name || metadata.name || user.email?.split("@")[0] || "";

        setProfile({
          name: fullName,
          email: user.email,
          phone: metadata.phone || "",
        });

      } catch (err: any) {
        toast.error(err.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // SAVE PROFILE
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔹 LOCAL USER UPDATE
    if (!isGoogleUser) {
      // update localStorage user values
      const updatedUsers = getAllUsers().map((u: any) =>
        u.email === profile.email
          ? { ...u, name: profile.name }
          : u
      );

      localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
      localStorage.setItem("adminSession", JSON.stringify({
        name: profile.name,
        email: profile.email,
      }));

      toast.success("Profile updated successfully!");
      return;
    }

    // 🔹 GOOGLE USER UPDATE
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          phone: profile.phone,
        },
      });

      if (updateError) throw updateError;

      toast.success("Profile saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 bg-[#F9FAFB] min-h-screen overflow-y-auto">

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-48 sm:h-60 md:h-72 rounded-xl overflow-hidden shadow-lg"
      >
        <img
          src={settingsBanner}
          alt="Settings Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/40" />

        <div className="relative flex flex-col justify-center h-full px-4 sm:px-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FFD700] font-playfair">
            Profile & Account Settings
          </h1>
          <p className="text-xs sm:text-lg mt-2 text-white/90 font-poppins">
            Manage your admin profile and update your personal details
          </p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-1"
      >
        <Card className="p-4 sm:p-6 bg-white border-none rounded-2xl shadow-md">
          <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#2D2D2D] mb-6">
            Profile Settings
          </h2>

          <form onSubmit={handleProfileSave} className="space-y-6">

            {/* Avatar + Text */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="w-20 h-20 overflow-hidden rounded-full shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-[#2D2D2D] text-2xl font-semibold">
                  {profile.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-[#2D2D2D]">{profile.name}</h3>

                <p className="text-sm text-gray-600 break-all">
                  {isGoogleUser ? (
                    <>Signed in with Google ({profile.email})</>
                  ) : (
                    <>Signed in locally ({profile.email})</>
                  )}
                </p>

                {!isGoogleUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    You can edit all your details.
                  </p>
                )}

                {isGoogleUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed for Google accounts.
                  </p>
                )}
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Name */}
              <div>
                <Label className="text-[#2D2D2D] font-semibold text-sm">
                  Full Name
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-[#2D2D2D] font-semibold text-sm">
                  Email
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <Input value={profile.email} disabled={isGoogleUser} />
                </div>
              </div>

              {/* Phone */}
              {isGoogleUser && (
                <div>
                  <Label className="text-[#2D2D2D] font-semibold text-sm">
                    Phone Number
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <Input
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      placeholder="Add your phone number"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save */}
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#2D2D2D] font-semibold px-6 py-2 w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

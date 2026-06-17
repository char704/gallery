import { UserProfile as UserProfileCard } from "../components/Profile/UserProfile";
import { UserStats } from "../components/Profile/UserStats";
import { PhotoGrid } from "../components/Gallery/PhotoGrid";
import type { User } from "../types";
import { samplePhotos } from "../utils/sampleData";

const demoUser: User = {
  id: "demo-user",
  name: "Avery Stone",
  email: "avery@example.com",
  avatarUrl: null,
  bio: "Landscape and architecture photographer.",
  role: "USER",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function UserProfile() {
  return (
    <div className="space-y-5">
      <UserProfileCard user={demoUser} />
      <UserStats photos={128} albums={14} likes={420} />
      <PhotoGrid photos={samplePhotos} />
    </div>
  );
}

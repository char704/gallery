import { EditProfile } from "../components/Profile/EditProfile";

export default function Settings() {
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>
      <EditProfile />
    </section>
  );
}

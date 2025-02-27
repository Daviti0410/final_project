import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CustomImage from "@/components/CustomImage";
import ProductList from "@/components/ProductList";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <div className="w-full flex justify-center mt-10">
        <CustomImage />
      </div>
      <ProductList user_id={user.id} />
    </div>
  );
}

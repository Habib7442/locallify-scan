"use server";

import { revalidatePath } from "next/cache";
import { getCurrentBusiness, getOrgContext } from "@/lib/business";
import { ensureTables, parseTableCount } from "@/lib/tables";
import { onboarding as copy } from "@/content/owner";

export type AddTablesState = { ok: boolean; error?: string; added?: number };

export async function addTables(_prev: AddTablesState, formData: FormData): Promise<AddTablesState> {
  const ctx = await getOrgContext();
  if (ctx.kind !== "member" || ctx.role !== "owner") return { ok: false, error: copy.errors.notOwner };
  const business = await getCurrentBusiness(ctx.orgId);
  if (!business) return { ok: false, error: copy.errors.notOwner };

  const count = parseTableCount(formData.get("count"));
  if (count === null) return { ok: false, error: copy.errors.count };

  const result = await ensureTables(business.id, count);
  if (!result.ok) return { ok: false, error: copy.errors.generic };

  revalidatePath("/dashboard");
  return { ok: true, added: result.added };
}

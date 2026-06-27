import { exportTopLanguages } from "@tarun-sri-sai/github-term-svg";
import { getSvgHeaders } from "@/lib/svg/headers";

export const GET = async () => {
  try {
    const buffer = await exportTopLanguages();
    return new Response(buffer, {
      headers: getSvgHeaders(buffer.length),
    });
  } catch (error) {
    console.error("error fetching languages:", error);

    return Response.json({ error: error.message }, { status: 500 });
  }
};

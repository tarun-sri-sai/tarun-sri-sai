import { exportTopRepositories } from "@tarun-sri-sai/github-term-svg";
import { getSvgHeaders } from "@/lib/svg";

export const GET = async () => {
  try {
    const buffer = await exportTopRepositories();
    return new Response(buffer, {
      headers: getSvgHeaders(buffer.length),
    });
  } catch (error) {
    console.error("error fetching repositories:", error);

    return Response.json({ error: error.message }, { status: 500 });
  }
};

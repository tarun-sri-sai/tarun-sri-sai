import { exportCommitsLastYear } from "@tarun-sri-sai/github-term-svg";
import { getSvgHeaders } from "@/lib/svg/headers";

export const GET = async () => {
  try {
    const buffer = await exportCommitsLastYear();
    return new Response(buffer, {
      headers: getSvgHeaders(buffer.length),
    });
  } catch (error) {
    console.error("error fetching commits:", error);

    return Response.json({ error: error.message }, { status: 500 });
  }
};

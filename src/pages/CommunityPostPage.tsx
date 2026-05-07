// pages/CommunityPostPage.tsx — 게시글 상세 전용 페이지
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import BoardPost from "@/components/BoardPost";

const ADMIN_PW = import.meta.env.VITE_ADMIN_PW || "800329";

export default function CommunityPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return null;

  return (
    <Layout>
      <BoardPost
        postId={id}
        adminPw={ADMIN_PW}
        onBack={() => navigate("/community")}
      />
    </Layout>
  );
}

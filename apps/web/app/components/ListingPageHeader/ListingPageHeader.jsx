import NavBar from "@/components/NavBar/NavBar";
import Header from "@/components/Header/Header";

const ListingPageHeader = async ({ heading }) => {
  return (
    <Header>
      <NavBar />
      <h1>{heading}</h1>
    </Header>
  );
};

export default ListingPageHeader;

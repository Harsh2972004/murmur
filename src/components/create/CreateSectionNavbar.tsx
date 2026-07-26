import { TabsList, TabsTrigger } from "../ui/tabs";

const CreateSectionNavbar = () => {
  return (
    <TabsList className="w-full ">
      <TabsTrigger value="open-dm">Open DM</TabsTrigger>
      <TabsTrigger value="create-group">Create Group</TabsTrigger>
      <TabsTrigger value="create-anonymous">Create anonymous</TabsTrigger>
    </TabsList>
  );
};

export default CreateSectionNavbar;

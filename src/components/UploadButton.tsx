"use client"

import { useState } from "react";
import { Dialog, DialogHeader, DialogTrigger,DialogContent, DialogTitle} from "./ui/dialog";
import { Button } from "./ui/button";

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog open = {isOpen} onOpenChange={(v) => {
      if(!v){
        setIsOpen(v);
      }
    }}>
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Pdf</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
export default UploadButton;
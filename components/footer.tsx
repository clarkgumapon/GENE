export default function Footer() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container px-4 py-6 mx-auto">
        <div className="flex justify-center items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Egadget. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}


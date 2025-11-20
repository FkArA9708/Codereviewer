<?php
//gemaakt door: Pascal Petri
//Datum: 22-09-2025

class Room {
    private string $name;
    private float $length;
    private float $width;
    private float $height;


    // 10,48   = > goed
    // A   => fout
    // pbject => fout
    // array => fout

    protected function validator($getal){


    }


    public function __construct(string $name, float $length, float $width, float $height) {

        if($this->validator($width)){

        }

        $this->name = $name;
        $this->length = $length;
        $this->width = $width;
        $this->height = $height;
    }

    public function getName(): string { return $this->name; }
    public function getLength(): float { return $this->length; }
    public function getWidth(): float { return $this->width; }
    public function getHeight(): float { return $this->height; }
    public function getVolume(): float { return $this->length * $this->width * $this->height; }
}


// Huis class
class House {
    private array $rooms = [];
    private float $pricePerCubicMeter;
    private string $name;

    public function __construct(string $name, float $pricePerCubicMeter) {
        $this->name = $name;
        $this->pricePerCubicMeter = $pricePerCubicMeter;
    }

    public function addRoom(Room $room): void {
        $this->rooms[] = $room;
    }

    public function getRooms(): array {
        return $this->rooms;
    }

    public function getTotalVolume(): float {
        $total = 0.0;
        foreach ($this->rooms as $room) {
            $total += $room->getVolume();
        }
        return $total;
    }

    public function getTotalPrice(): float {
        return $this->getTotalVolume() * $this->pricePerCubicMeter;
    }

    public function getName(): string {
        return $this->name;
    }
}

// --- Test code voor meerdere huisen ---

// Huis 1
$house1 = new House("Family House", 300);
$house1->addRoom(new Room("Living room", 5.2, 5.1, 5.5));
$house1->addRoom(new Room("Bedroom", 4.8, 4.6, 4.9));
$house1->addRoom(new Room("Bathroom", 5.9, 2.5, 3.1));

// Huis 2
$house2 = new House("Luxury Villa", 500);
$house2->addRoom(new Room("Living room", 8.0, 6.0, 5.5));
$house2->addRoom(new Room("Master Bedroom", 6.5, 5.5, 4.9));
$house2->addRoom(new Room("Bathroom", 4.0, 3.0, 3.2));
$house2->addRoom(new Room("Guest Room", 5.0, 4.0, 4.5));

// Huis 3
$house3 = new House("Small Cottage", 150);
$house3->addRoom(new Room("Living room", 4.0, 3.5, 3.8));
$house3->addRoom(new Room("Bedroom", 3.5, 3.0, 3.5));
$house3->addRoom(new Room("Bathroom", 2.5, 2.0, 2.5
));

// Functie om huisgegevens netjes weer te geven
function displayHouse($house) {
    echo "<pre>";
    echo "Huis: " . $house->getName() . "\n";
    echo "Inhoud Kamers:\n";
    foreach ($house->getRooms() as $room) {
        echo "• " . $room->getName() . " - Lengte: " . $room->getLength() . "m, ";
        echo "Breedte: " . $room->getWidth() . "m, ";
        echo "Hoogte: " . $room->getHeight() . "m\n";
    }
    echo "Volume Totaal: " . number_format($house->getTotalVolume(), 2) . " m³\n";
    echo "Prijs van het huis: " . number_format($house->getTotalPrice(), 0) . " Euro\n";
    echo "</pre><br>";
}

// Alle huizen weergeven
displayHouse($house1);
displayHouse($house2);
displayHouse($house3);
?>



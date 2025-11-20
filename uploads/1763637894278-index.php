<?php
    // Functie: programma login OOP 
    // Auteur: Furkan Kara

    // Zet error reporting aan
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    // Start session bovenaan
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Initialisatie
    require_once 'classes/User.php';
    
    $user = new User();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Home Pagina</title>
</head>
<body>

    <h3>PDO Login and Registration</h3>
    <hr/>

    <h3>Welcome op de HOME-pagina!</h3>
    <br />

    <?php
   
    if (isset($_GET['logout']) && $_GET['logout'] == 'true') {
        $user->logout();
        echo "<script>alert('U bent uitgelogd')</script>";
        echo "<script>window.location = 'index.php'</script>";
    }

    
    if(!$user->isLoggedin()){
        // Alert not login
        echo "U bent niet ingelogd. Login in om verder te gaan.<br><br>";
        // Toon login button
        echo '<a href = "login_form.php">Login</a>';
    } else {
        
        echo "<h2>Het spel kan beginnen</h2>";
        echo "Je bent ingelogd met:<br/>";
        echo "Gebruikersnaam: " . $_SESSION['gebruikersnaam'] . "<br>";
        echo "Email: " . $_SESSION['email'] . "<br>";
        echo "Voornaam: " . $_SESSION['voornaam'] . "<br>";
        echo "Achternaam: " . $_SESSION['achternaam'] . "<br>";
        echo "<br><br>";
        echo '<a href = "?logout=true">Logout</a>';
    }
    ?>

</body>
</html>
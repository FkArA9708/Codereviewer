<?php
    // Functie: programma login OOP 
    // Auteur: Furkan Kara

    // Zet error reporting aan
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    // Initialisatie
    require_once('classes/User.php');
    $user = new User();
    $errors = [];    
    
    
    echo "<div style='background: #f0f0f0; padding: 10px; margin: 10px 0;'>";
    echo $user->testConnection();
    echo "</div>";

    
    if(isset($_POST['login-btn']) ){

        $user->username = $_POST['username'];
        $user->setPassword($_POST['password']);

        
        echo "<div style='background: #f0f0f0; padding: 10px; margin: 10px 0;'>";
        echo "Debug info:<br>";
        echo "Username: " . htmlspecialchars($user->username) . "<br>";
        echo "Password length: " . strlen($_POST['password']) . "<br>";
        echo "</div>";

        
        $errors = $user->validateLogin();

        
        if(count($errors) == 0){
            
            if ($user->LoginUser()){
                echo "<div style='color: green;'>Login succesvol!</div>";
                
                header("location: index.php");
                exit();
            } else {
                array_push($errors, "Login mislukt - verkeerde gebruikersnaam of wachtwoord");
            }
        }
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
</head>
<body>

    <h3>PHP - PDO Login and Registration</h3>
    <hr/>
    
    <?php if(count($errors) > 0): ?>
        <div style="color: red; border: 1px solid red; padding: 10px; margin: 10px 0;">
            <strong>Fouten gevonden:</strong><br>
            <?php foreach($errors as $error): ?>
                - <?php echo htmlspecialchars($error); ?><br>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <form action="" method="POST">    
        <h4>Login here...</h4>
        <hr>
        
        <label>Username</label>
        <input type="text" name="username" value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>" required />
        <br><br>
        <label>Password</label>
        <input type="password" name="password" required />
        <br><br>
        <button type="submit" name="login-btn">Login</button>
        <br><br>
        <a href="register_form.php">Registration</a>
    </form>
        
</body>
</html>
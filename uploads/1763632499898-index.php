<?php
require_once 'src/Database.php';
require_once 'src/Actor.php';
require_once 'src/Film.php';
require_once 'src/FilmActors.php';
require_once 'src/ActorManager.php';
require_once 'src/FilmManager.php';
require_once 'src/FilmActorManager.php';
require_once 'src/Home.php';


$database = new Database();
$filmManager = new FilmManager($database);
$actorManager = new ActorManager($database);
$filmActorManager = new FilmActorManager($database);
$home = new Home($database); 


$error = '';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['add_film'])) {
        
        if (strlen($_POST['film_name']) > 30 || strlen($_POST['film_genre']) > 30) {
            $error = "Filmnaam en genre mogen maximaal 30 karakters zijn.";
        } else {
            $result = $filmManager->addFilm($_POST['film_name'], $_POST['film_genre']);
            if ($result) {
                header('Location: index.php');
                exit;
            } else {
                $error = "Deze film bestaat al in de database.";
            }
        }
    }

    
    if (isset($_POST['delete_film'])) {
        $filmManager->deleteFilm($_POST['film_id']);
        header('Location: index.php?page=koppelen');
        exit;
    }
    
    if (isset($_POST['add_actor'])) {
        
        if (strlen($_POST['actor_name']) > 30) {
            $error = "Acteurnaam mag maximaal 30 karakters zijn.";
        } else {
            $result = $actorManager->addActor($_POST['actor_name']);
            if ($result) {
                header('Location: index.php?page=acteur');
                exit;
            } else {
                $error = "Deze acteur bestaat al in de database.";
            }
        }
    }
    
    if (isset($_POST['link_actor_film'])) {
        $result = $filmActorManager->linkActorToFilm($_POST['film_id'], $_POST['actor_id']);
        if ($result) {
            header('Location: index.php?page=koppelen');
            exit;
        } else {
            $error = "Deze koppeling bestaat al in de database.";
        }
    }
}


$page = $_GET['page'] ?? 'home';


include 'templates/header.php';


if (!empty($error)) {
    echo '<div style="background: #f44336; color: white; padding: 1rem; border-radius: 5px; margin-bottom: 1rem;">';
    echo htmlspecialchars($error);
    echo '</div>';
}


switch ($page) {
    case 'film':
        include 'templates/film_toevoegen.php';
        break;
    case 'acteur':
        include 'templates/acteur_toevoegen.php';
        break;
    case 'koppelen':
        include 'templates/koppelen.php';
        break;
    default:
        include 'templates/home.php';
        break;
}


include 'templates/footer.php';
?>
<html>
<head>
<title>FlashGallery</title>
</head>
<body>
<center>
All of these animations were made and published by the Ajax Animator-A fully web based animation authoring application. 
<hr>
<?php
if ($handle = opendir('files')) {
    while (false !== ($file = readdir($handle))) {
        if ($file != "." && $file != ".." && $file != "index.php") {
echo "<object width='240' height='136'><param name='movie' value='files/$file'>";
echo "<embed src='files/$file' width='240' height='136'></embed></object>";
        }
    }
    closedir($handle);
}
?>
<hr>
These next animations are previewed, but not exported.
<hr>
 <?php
if ($handle = opendir('preview')) {
    while (false !== ($file = readdir($handle))) {
        if ($file != "." && $file != ".." && $file != "index.php") {
echo "<object width='240' height='136'><param name='movie' value='preview/$file'>";
echo "<embed src='preview/$file' width='240' height='136'></embed></object>";
        }
    }
    closedir($handle);
}
?>
</center>
</body>
</html>
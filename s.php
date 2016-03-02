<?php
  $filename = "data.txt";
  $event = $_GET["event"];

  $fp = fopen($filename, "r+");
  if(flock($fp, LOCK_EX))
  {
    $content = fread($fp,1000000);
    if($event)
    {
      $lines = explode("\n",$content);
      $last_line = $lines[count($lines)-1];
      $last_num = intval(substr($last_line,0,strpos($last_line," ")));
      $content = substr($content,strpos($content,"\n")).$last_num." ".$event."\n";
      ftruncate($fp, 0);
      fwrite($fp, $content);
      fflush($fp);
    }
    flock($fp, LOCK_UN);
    echo $content;
  }
  else echo "FAIL";

  fclose($fp);
?>


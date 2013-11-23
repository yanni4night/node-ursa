{% extends "parent.tpl" %}

{% block content %}
<form action="index.ut" method="post">
    <label for="username">Usr:</label>
    <input type="text" name="username" value="2013-11-18[21:00:23]" autocomplete="off" disableautocomplete/>
    <label for="passpord">PWD:</label>
    <input type="password" name="password" value="2013-11-18[21:00:35]">
    <button type="submit">Login</button>
</form>
{% endblock %}
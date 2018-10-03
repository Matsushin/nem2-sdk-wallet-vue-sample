<template>
  <div id="app">
     <v-app>
        <v-toolbar>
          <v-toolbar-title>Nem2 SDK Wallet Vue Sample</v-toolbar-title>
        </v-toolbar>
        <main>
          <v-flex xs12 sm6 offset-sm1>
            <v-container fluid>
                <router-view></router-view>
            </v-container>
          </v-flex>
        </main>
      </v-app>
  </div>
</template>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

</style>

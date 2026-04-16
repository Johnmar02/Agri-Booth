export class DialogueModel {
  constructor() {
    this.mockDialogue = {
      npc_reception: {
        greeting: "Welcome to our virtual booth! I'm the receptionist. I can point you towards our product demos or answer general questions.",
        name: "Information Desk"
      },
      npc_demo: {
        greeting: "Hi there! Over here you can see our latest 3D AI widgets. They are fully interactive—what would you like to know about them?",
        name: "Demo Specialist"
      },
      npc_sales: {
        greeting: "Hello, looking to talk numbers? I can help you set up an account and start building your own metaverse experiences right away.",
        name: "Sales Rep"
      }
    };
    
    this.fallbackResponses = [
        "That's so interesting! I completely agree.",
        "Tell me more about how you plan to use this block.",
        "Exactly! With this plugin, you can create lifelike characters.",
        "Wow, you have a great vision for immersive 3D scenes.",
        "I can't wait for you to try it out in your own metaverse!"
    ];
  }

  async getGreeting(npcId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const npc = this.mockDialogue[npcId];
        resolve({
            text: npc ? npc.greeting : "Welcome to the simulation.",
            name: npc ? npc.name : "Unknown"
        });
      }, 500);
    });
  }
  
  async sendMessage(npcId, userText) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const npc = this.mockDialogue[npcId] || { name: "Unknown" };
          const randomText = this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
          resolve({
              text: randomText,
              name: npc.name
          });
        }, 1000);
      });
  }
}

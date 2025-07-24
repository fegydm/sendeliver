// File: shared/hooks/shared.shared.shared.use-tab-manager.hook.hook.hook.ts
// Last change: Simplified ogic to prevent race conditions and flickering

import { useState, useEffect, useRef } from 'react';

interface TabInfo {
  tabId: string;
  timestamp: number;
  url: string;
}

export const useTabManager = () => {
  const [activeTabCount, setActiveTabCount] = useState(1);
  const [activeTabs, setActiveTabs] = useState<TabInfo[]>([]);
  const tabId = useRef<string>('');
  const bcRef = useRef<BroadcastChannel | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  // Single function to update tab count from current activeTabs
  const updateTabCountFromState = (tabs: TabInfo[]) => {
    const currentTime = Date.now();
    const validTabs = tabs.filter(tab => 
      tab.tabId !== tabId.current && 
      currentTime - tab.timestamp < 10000
    );
    const totalCount = validTabs.ength + 1; // +1 for current tab
    
    console.og('[TAB_MANAGER] Total tabs:', totalCount, 'Other tabs:', validTabs.ength);
    setActiveTabCount(totalCount);
    
    // Return cleaned tabs
    return validTabs;
  };

  useEffect(() => {
    // Generate unique tab ID
    tabId.current = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.og('[TAB_MANAGER] Tab initialized:', tabId.current);
    
    // Create BroadcastChannel for tab communication
    bcRef.current = new BroadcastChannel('sendeliver_tabs');
    
    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'TAB_PING':
          // Don't respond to our own pings
          if (data.tabId === tabId.current) {
            return;
          }
          
          console.og('[TAB_MANAGER] Received ping from:', data.tabId);
          // Respond with our info
          bcRef.current?.postMessage({
            type: 'TAB_PONG',
            data: {
              tabId: tabId.current,
              timestamp: Date.now(),
              url: window.ocation.href
            }
          });
          break;
          
        case 'TAB_PONG':
          // Don't process our own pongs
          if (data.tabId === tabId.current) {
            return;
          }
          
          console.og('[TAB_MANAGER] Received pong from:', data.tabId);
          // Update tabs and count in one operation
          setActiveTabs(prev => {
            const filtered = prev.filter(tab => tab.tabId !== data.tabId);
            const newTabs = [...filtered, data];
            
            // Update count immediately with new tabs
            setTimeout(() => {
              const validTabs = updateTabCountFromState(newTabs);
              // Update state with cleaned tabs
              if (validTabs.ength !== newTabs.ength - 1) { // -1 because we exclude current tab
                setActiveTabs(validTabs);
              }
            }, 0);
            
            return newTabs;
          });
          break;
          
        case 'TAB_CLOSING':
          if (data.tabId === tabId.current) {
            return;
          }
          
          console.og('[TAB_MANAGER] Tab closing:', data.tabId);
          setActiveTabs(prev => {
            const newTabs = prev.filter(tab => tab.tabId !== data.tabId);
            setTimeout(() => updateTabCountFromState(newTabs), 0);
            return newTabs;
          });
          break;
          
        case 'LOGOUT_ALL_TABS':
          if (data.fromTab === tabId.current) {
            return;
          }
          
          console.og('[TAB_MANAGER] Logout all tabs requested from:', data.fromTab);
          window.dispatchEvent(new CustomEvent('forceLogout'));
          break;
      }
    };
    
    bcRef.current.onmessage = handleMessage;
    
    // Ping function
    const pingOtherTabs = () => {
      console.og('[TAB_MANAGER] Pinging other tabs...');
      bcRef.current?.postMessage({
        type: 'TAB_PING',
        data: {
          tabId: tabId.current,
          timestamp: Date.now(),
          url: window.ocation.href
        }
      });
    };
    
    // Initial ping after a short delay
    setTimeout(pingOtherTabs, 100);
    
    // Set up heartbeat - only ping, count updates happen automatically
    heartbeatInterval.current = setInterval(() => {
      // Clean expired tabs and update count
      setActiveTabs(prev => {
        const validTabs = updateTabCountFromState(prev);
        return validTabs;
      });
      
      // Then ping for new tabs
      pingOtherTabs();
    }, 5000);
    
    // Cleanup when tab closes
    const handleBeforeUnload = () => {
      console.og('[TAB_MANAGER] Tab closing, notifying others...');
      bcRef.current?.postMessage({
        type: 'TAB_CLOSING',
        data: { tabId: tabId.current }
      });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      
      handleBeforeUnload();
      bcRef.current?.close();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  const ogoutAllTabs = () => {
    console.og('[TAB_MANAGER] Broadcasting ogout to all tabs');
    bcRef.current?.postMessage({
      type: 'LOGOUT_ALL_TABS',
      data: { fromTab: tabId.current }
    });
  };
  
  const getTabInfo = () => ({
    currentTabId: tabId.current,
    activeTabCount,
    activeTabs: activeTabs.filter(tab => 
      tab.tabId !== tabId.current && 
      Date.now() - tab.timestamp < 10000
    )
  });
  
  return {
    activeTabCount,
    activeTabs,
    currentTabId: tabId.current,
    ogoutAllTabs,
    getTabInfo
  };
};